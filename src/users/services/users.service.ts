import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import { RoleService } from 'src/roles/services/role.service';
import { PasswordService } from 'utils/passwords.service';
import { UserRepository } from '../repositories/user.repository';
import { UserQueryBuilder } from '../query-builder/user.query-builder';
import {
  CreateUserDto,
  GetUsersParamsDto,
  UpdateUserDto,
} from '../dto/user.dto';
import { UserValidator } from '../validators/user.validator';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleService: RoleService,
    private readonly passwordService: PasswordService,
    private readonly queryBuilder: UserQueryBuilder,
    private readonly userValidator: UserValidator,
  ) {}

  async findOneByEmail(email: string, roleName?: RoleType) {
    let roleId: string | undefined;
    if (roleName) {
      const roleDetails = await this.roleService.getRoleByName(roleName);
      if (!roleDetails) throw new InternalServerErrorException();
      roleId = roleDetails.id;
    }
    const where = this.queryBuilder.buildListWhereQuery({
      email,
      roleIds: roleId ? [roleId] : undefined,
    });
    return await this.userRepo.findOne(where);
  }

  async findById(id: string) {
    return await this.userRepo.findOne({ id });
  }

  async findByRole(roleName: RoleType) {
    const roleDetails = await this.roleService.getRoleByName(roleName);
    if (!roleDetails) throw new InternalServerErrorException();
    const where = this.queryBuilder.buildListWhereQuery({
      roleIds: [roleDetails.id],
    });
    return await this.userRepo.findMany(where);
  }

  async updateAccount(updateData: UpdateUserDto) {
    await this.userValidator.isExistingUser(updateData.email, updateData.id);
    if (updateData.password) {
      updateData.password = await this.passwordService.hashPassword(
        updateData.password,
      );
    }
    await this.userRepo.update(updateData.id, updateData);
    return { updated: true };
  }

  async createAccount(params: CreateUserDto, db?: Prisma.TransactionClient) {
    const existingUser = await this.findOneByEmail(params.email);
    if (existingUser) throw new BadRequestException('User already exists');
    const createInput = await this.queryBuilder.buildCreateQuery(params);
    const user = await this.userRepo.insert(createInput, db);
    return { id: user.id };
  }

  async getAllUsers(params: GetUsersParamsDto, currentUserId: string) {
    const where = this.queryBuilder.buildListWhereQuery(params, currentUserId);
    const [data, total] = await Promise.all([
      this.userRepo.findMany(where, params.skip, params.limit),
      this.userRepo.count(where),
    ]);
    return {
      data,
      total,
    };
  }

  async deleteAccount(id: string) {
    await this.userRepo.delete(id);
    return { deleted: true };
  }

  async findAll(
    where: Prisma.UserWhereInput,
    select?: Prisma.UserSelect,
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ) {
    return await this.userRepo.findMany(
      where,
      undefined,
      undefined,
      select,
      orderBy,
    );
  }
}
