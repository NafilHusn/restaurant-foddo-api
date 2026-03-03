// cache.service.ts
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Command } from 'ioredis';

export type CachedEntry<T> = Record<keyof T, string>;

@Injectable()
export class CacheService implements OnModuleDestroy, OnModuleInit {
  private redis: Redis;
  private enabled = false;
  onModuleInit() {
    this.initRedis();
  }
  initRedis() {
    if (this.redis) return this.redis;
    this.enabled = this.configService.get<boolean>(
      'CACHING_ENABLED',
    ) as boolean;
    if (this.enabled) {
      this.redis = new Redis({
        host: process.env.REDIS_HOST as string,
        port: Number(process.env.REDIS_PORT),
        maxRetriesPerRequest: 5,
        connectTimeout: 5000,
        retryStrategy(times) {
          if (times >= 5) return null;
          return 1000;
        },
      });
      this.redis.on('connecting', () => Logger.log('Connecting to Redis'));
      this.redis.on('connect', () => {
        Logger.log('Redis connected');
        this.enabled = true;
      });
      this.redis.on('error', () => {
        Logger.error('Redis error');
        this.enabled = false;
      });
    }
  }

  constructor(private readonly configService: ConfigService) {}

  private readonly DEFAULT_CACHE_PREFIX = 'vb-accounts';

  async get(key: string): Promise<string | null>;
  async get<T extends object>(key: string): Promise<T | null>;

  async get(key: string): Promise<any> {
    if (!this.enabled) return null;
    key = `${this.DEFAULT_CACHE_PREFIX}-${key}`;
    const value = await this.redis.get(key);
    if (value == null) return null;

    try {
      return JSON.parse(value) as object;
    } catch {
      return value;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = 60 * 60 * 24 * 7,
  ): Promise<void> {
    if (!this.enabled) return;
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(
        `${this.DEFAULT_CACHE_PREFIX}-${key}`,
        val,
        'EX',
        ttlSeconds,
      );
    } else {
      await this.redis.set(`${this.DEFAULT_CACHE_PREFIX}-${key}`, val);
    }
  }

  async setAdd(key: string, value: string[]) {
    if (!this.enabled || !value.length) return;
    const fullKey = `${this.DEFAULT_CACHE_PREFIX}-${key}`;
    await this.redis.del(fullKey);
    await this.redis.sadd(fullKey, ...value);
  }

  async getMembers(key: string) {
    if (!this.enabled) return;
    return await this.redis.smembers(`${this.DEFAULT_CACHE_PREFIX}-${key}`);
  }

  async getMember(key: string, member: string) {
    if (!this.enabled) return;
    return await this.redis.sismember(
      `${this.DEFAULT_CACHE_PREFIX}-${key}`,
      member,
    );
  }

  async del(key: string): Promise<void> {
    if (!this.enabled) return;
    await this.redis.del(`${this.DEFAULT_CACHE_PREFIX}-${key}`);
  }

  async deleteByPrefix(prefix: string) {
    return await this.deleteByMatch(`${this.DEFAULT_CACHE_PREFIX}-${prefix}*`);
  }

  async deleteBySuffix(suffix: string) {
    return await this.deleteByMatch(`${suffix}`);
  }

  private async deleteByMatch(match: string): Promise<void> {
    if (!this.enabled) return;

    const stream = this.redis.scanStream({
      match,
      count: 100,
    });

    const pendingDeletes: Promise<any>[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          // Queue the delete operation
          pendingDeletes.push(this.redis.del(...keys));
        }
      });

      stream.on('end', () => {
        Promise.all(pendingDeletes)
          .then(() => resolve())
          .catch(reject);
      });

      stream.on('error', reject);
    });
  }

  async runCommand(command: Command) {
    if (!this.enabled) return null;
    await this.redis.sendCommand(command);
    Logger.log(`Redis Command Ran: ${command.name}`);
  }

  async addKeyToTag(tag: string, key: string) {
    if (!this.enabled) return;
    await this.redis.sadd(`tag:${tag}`, key);
  }

  async getKeysByTag(tag: string): Promise<string[]> {
    if (!this.enabled) return [];
    return this.redis.smembers(`tag:${tag}`);
  }

  async clearTag(tag: string) {
    if (!this.enabled) return;
    await this.redis.del(`tag:${tag}`);
  }

  async onModuleDestroy() {
    if (this.enabled) await this.redis.quit();
  }
}
