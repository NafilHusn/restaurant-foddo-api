import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import DatabaseService from 'utils/db/db.service';
import { UserQueryBuilder } from '../query-builder/user.query-builder';

@Injectable()
export class UserRepository {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly queryBuilder: UserQueryBuilder,
  ) {}

  async findOne(where: Prisma.UserWhereInput) {
    const entry = await this.dbService.user.findFirst({
      where,
      include: { Role: true },
    });
    return entry;
  }

  async findFirst(where: Prisma.UserWhereInput) {
    return await this.dbService.user.findFirst({
      where,
      include: { Role: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const updated = await this.dbService.user.update({
      where: { id, deletedAt: null },
      data,
    });
    return updated;
  }

  async delete(id: string) {
    return await this.dbService.user.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }

  async findMany(
    where?: Prisma.UserWhereInput,
    skip?: number,
    limit?: number,
    select: Prisma.UserSelect = this.queryBuilder.buildSelectQuery(),
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ) {
    const entries = await this.dbService.user.findMany({
      where,
      skip,
      take: limit,
      select,
      orderBy,
    });
    return entries;
  }

  async insert(
    data: Prisma.UserUncheckedCreateInput,
    db: Prisma.TransactionClient = this.dbService,
  ) {
    const createdUser = await db.user.create({ data });
    return createdUser;
  }

  async count(where?: Prisma.UserWhereInput) {
    return await this.dbService.user.count({ where });
  }
}
