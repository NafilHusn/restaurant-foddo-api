import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { RoleType } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  checkRole = (roleName: string) => (role: string) => role === roleName;

  checkAdminRole = this.checkRole(RoleType.ADMIN);

  async getRoleByName(name: RoleType) {
    return await this.roleRepo.findOne({ name });
  }

  async getRoleById(id: string) {
    return await this.roleRepo.findOne({ id });
  }

  async getRoleByIds(ids: string[]) {
    return await this.roleRepo.findMany({ id: { in: ids } });
  }

  async getAllRoles() {
    return await this.roleRepo.findMany({});
  }
}
