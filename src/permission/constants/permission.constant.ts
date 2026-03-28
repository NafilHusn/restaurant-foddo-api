import { RoleType } from '@prisma/client';

export const CURRENT_PERMISSIONS = [
  {
    module: 'User',
    permissions: [
      {
        key: 'user:create',
        action: 'CREATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'user:read',
        action: 'READ',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'user:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'user:delete',
        action: 'DELETE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Restaurant',
    permissions: [
      {
        key: 'restaurant:create',
        action: 'CREATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'restaurant:read',
        action: 'READ',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'restaurant:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'restaurant:delete',
        action: 'DELETE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Menu Category',
    permissions: [
      {
        key: 'menu-category:create',
        action: 'CREATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'menu-category:read',
        action: 'READ',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'menu-category:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'menu-category:delete',
        action: 'DELETE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Menu Item',
    permissions: [
      {
        key: 'menu-item:create',
        action: 'CREATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.MANAGER],
      },
      {
        key: 'menu-item:read',
        action: 'READ',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'menu-item:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'menu-item:delete',
        action: 'DELETE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Order',
    permissions: [
      {
        key: 'order:create',
        action: 'CREATE',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'order:read',
        action: 'READ',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'order:update',
        action: 'UPDATE',
        assignedRoles: [
          RoleType.ADMIN,
          RoleType.SUPER_ADMIN,
          RoleType.MANAGER,
          RoleType.MEMBER,
        ],
      },
      {
        key: 'order:delete',
        action: 'DELETE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'order:payment:method:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN],
      },
      {
        key: 'order:payment:status:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.MANAGER],
      },
      {
        key: 'order:status:update',
        action: 'UPDATE',
        assignedRoles: [RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.MANAGER],
      },
    ],
  },
];
