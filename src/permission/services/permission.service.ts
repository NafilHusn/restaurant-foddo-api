import { PermissionRepository } from '../repositories/permission.repository';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CURRENT_PERMISSIONS } from '../constants/permission.constant';
import { RoleService } from '../../roles/services/role.service';
import { PermissionQueryBuilder } from '../query-builder/permission.query-builder';
import { RoleType } from '@prisma/client';

@Injectable()
export class PermissionService implements OnModuleInit {
  constructor(
    private readonly repo: PermissionRepository,
    private readonly queryBuilder: PermissionQueryBuilder,
    private readonly roleService: RoleService,
  ) {}

  async onModuleInit() {
    const roleMap = new Map<string, string>();
    const allRoles = await this.roleService.getAllRoles();
    allRoles.forEach((role) => roleMap.set(role.name, role.id));

    for (const moduleWithPermission of CURRENT_PERMISSIONS) {
      const moduleArgs = this.queryBuilder.buildModuleUpsertArgs(
        moduleWithPermission.module,
      );
      const module = await this.repo.upsertModule(moduleArgs);

      for (const permission of moduleWithPermission.permissions) {
        const permissionArgs = this.queryBuilder.buildPermissionUpsertArgs(
          permission,
          module.id,
          roleMap,
        );
        await this.repo.upsertPermission(permissionArgs);
      }
    }
    await this.repo.setPermissionToCache();
  }

  async getPermissionByRole(role: RoleType[]) {
    return this.repo.getPermissionKeysByRole(role);
  }

  async hasPermission(role: RoleType, permission: string) {
    return this.repo.checkPermission(role, permission);
  }

  async getAllPermissionsWithModules(roles: RoleType[]) {
    const data = await this.repo.getAllPermissionsWithModules(roles);
    return { data };
  }
}
