import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import DatabaseService from './db.service';

@Injectable()
export class TransactionService {
  constructor(private readonly dbService: DatabaseService) {}

  async runTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    timeout: number = 10 * 1000 * 1000,
  ): Promise<T> {
    return this.dbService.$transaction(callback, { timeout });
  }
}

export default TransactionService;
