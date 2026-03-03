import { Roles } from '../../roles/constants/role.constants';

export const CURRENT_PERMISSIONS = [
  {
    module: 'User',
    permissions: [
      {
        key: 'user:create',
        action: 'CREATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'user:read',
        action: 'READ',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'user:update',
        action: 'UPDATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'user:delete',
        action: 'DELETE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Restaurant',
    permissions: [
      {
        key: 'restaurant:create',
        action: 'CREATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'restaurant:read',
        action: 'READ',
        assignedRoles: [
          Roles.ADMIN,
          Roles.SUPER_ADMIN,
          Roles.MANAGER,
          Roles.MEMBER,
        ],
      },
      {
        key: 'restaurant:update',
        action: 'UPDATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'restaurant:delete',
        action: 'DELETE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Menu Category',
    permissions: [
      {
        key: 'menu-category:create',
        action: 'CREATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'menu-category:read',
        action: 'READ',
        assignedRoles: [
          Roles.ADMIN,
          Roles.SUPER_ADMIN,
          Roles.MANAGER,
          Roles.MEMBER,
        ],
      },
      {
        key: 'menu-category:update',
        action: 'UPDATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'menu-category:delete',
        action: 'DELETE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
    ],
  },
  {
    module: 'Menu Item',
    permissions: [
      {
        key: 'menu-item:create',
        action: 'CREATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'menu-item:read',
        action: 'READ',
        assignedRoles: [
          Roles.ADMIN,
          Roles.SUPER_ADMIN,
          Roles.MANAGER,
          Roles.MEMBER,
        ],
      },
      {
        key: 'menu-item:update',
        action: 'UPDATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'menu-item:delete',
        action: 'DELETE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
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
          Roles.ADMIN,
          Roles.SUPER_ADMIN,
          Roles.MANAGER,
          Roles.MEMBER,
        ],
      },
      {
        key: 'order:read',
        action: 'READ',
        assignedRoles: [
          Roles.ADMIN,
          Roles.SUPER_ADMIN,
          Roles.MANAGER,
          Roles.MEMBER,
        ],
      },
      {
        key: 'order:update',
        action: 'UPDATE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
      {
        key: 'order:delete',
        action: 'DELETE',
        assignedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
      },
    ],
  },
];
