import { Injectable } from '@nestjs/common';
import DatabaseService from '../../../utils/db/db.service';
import { Prisma, RoleType } from '@prisma/client';
import { CacheService } from '../../../utils/cache/cache.service';

@Injectable()
export class PermissionRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  async upsertModule(module: Prisma.ModuleUpsertArgs) {
    return this.db.module.upsert(module);
  }

  async upsertPermission(permission: Prisma.PermissionUpsertArgs) {
    return this.db.permission.upsert(permission);
  }

  async getPermissionKeysByRole(role: RoleType[]) {
    let permissionKeys: string[] = [];
    const cached = await this.cache.getMembers(
      `permission:role:${role.join(',')}`,
    );
    if (cached && cached.length > 0) {
      return cached;
    }
    for (const r of role) {
      const cache = await this.cache.getMembers(`permission:role:${r}`);
      if (cache && cache.length > 0) {
        permissionKeys = [...permissionKeys, ...cache];
        continue;
      }
      const permissions = await this.db.permission.findMany({
        where: {
          rolePermissions: {
            some: {
              role: {
                name: r,
              },
            },
          },
        },
        select: { key: true },
      });
      const permissionKeysDB = permissions.map((p) => p.key);
      await this.cache.setAdd(`permission:role:${r}`, permissionKeysDB, 60);
      permissionKeys = [...permissionKeys, ...permissionKeysDB];
    }
    await this.cache.setAdd(
      `permission:role:${role.join(',')}`,
      permissionKeys,
    );
    return permissionKeys;
  }

  async setPermissionToCache() {
    // for (const r of Object.values(RoleType)) {
    await this.getPermissionKeysByRole(Object.values(RoleType));
    // }
  }

  async checkPermission(role: RoleType, permission: string) {
    try {
      return this.cache.getMember(`permission:role:${role}`, permission);
    } catch (error) {
      console.error(error);
      return this.db.permission.findFirst({
        where: {
          key: permission,
          rolePermissions: {
            some: {
              role: {
                name: role,
              },
            },
          },
        },
      });
    }
  }

  async getAllPermissionsWithModules(roles: RoleType[]) {
    const cache = await this.cache.get(`permission:modules:${roles.join(',')}`);
    if (cache && cache.length > 0) return cache;
    const modules = await this.db.module.findMany({
      where: {
        permissions: {
          some: {
            rolePermissions: {
              some: {
                role: {
                  name: { in: roles },
                },
              },
            },
          },
        },
      },
      select: {
        name: true,
        permissions: {
          where: {
            rolePermissions: {
              some: {
                role: {
                  name: { in: roles },
                },
              },
            },
          },
          select: {
            id: true,
            key: true,
            action: true,
          },
        },
      },
    });
    await this.cache.set(`permission:modules:${roles.join(',')}`, modules);
    return modules;
  }
}
