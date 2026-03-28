import { Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import { CreateUserDto, GetUsersParamsDto } from '../dto/user.dto';
import { PasswordService } from '../../../utils/passwords.service';

@Injectable()
export class UserQueryBuilder {
  constructor(private readonly passwordService: PasswordService) {}

  buildCheckExistingUserQuery(
    email: string,
    id: string,
  ): Prisma.UserWhereInput {
    return {
      deletedAt: null,
      email,
      id: { not: id },
    };
  }

  async buildCreateQuery(
    params: CreateUserDto,
  ): Promise<Prisma.UserCreateInput> {
    return {
      email: params.email,
      password: await this.passwordService.hashPassword(params.password),
      phone: params.phone,
      name: params.name,
      country: params.country,
      profilePicture: params.profilePicture,
      Role: { connect: params.roleIds.map((roleId) => ({ id: roleId })) },
    };
  }

  buildListWhereQuery(
    params: Omit<GetUsersParamsDto, 'limit' | 'skip'>,
    currentUserId?: string,
  ): Prisma.UserWhereInput {
    const { fromDate, toDate, country, email, phone, roleIds, search } = params;
    const AND: Prisma.UserWhereInput[] = [{ deletedAt: null }];

    if (roleIds) AND.push({ Role: { some: { id: { in: roleIds } } } });
    if (phone) AND.push({ phone });
    if (email) AND.push({ email });
    if (country) AND.push({ country });
    if (fromDate) AND.push({ createdAt: { gte: fromDate } });
    if (toDate) AND.push({ createdAt: { lte: toDate } });
    if (search)
      AND.push({
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      });
    if (currentUserId) {
      AND.push({ id: { not: currentUserId } });
      AND.push({
        Role: { some: { name: { notIn: [RoleType.SUPER_ADMIN] } } },
      });
    }
    return { AND };
  }

  buildSelectQuery() {
    return {
      id: true,
      email: true,
      name: true,
      phone: true,
      country: true,
      profilePicture: true,
      Role: true,
      createdAt: true,
      lastLoginAt: true,
    } satisfies Prisma.UserSelect;
  }
}
