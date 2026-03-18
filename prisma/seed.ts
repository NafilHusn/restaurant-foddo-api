// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Roles } from '../src/roles/constants/role.constants';
import { PasswordService } from '../utils/passwords.service';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});
const passwordService = new PasswordService();

async function main() {
  await prisma.role.createMany({
    data: Object.values(Roles).map((role) => ({ name: role })),
    skipDuplicates: true,
  });

  //   create admin user and assign permissions
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' },
    include: { Role: true },
  });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: await passwordService.hashPassword('admin123'),
        Role: { connect: { name: Roles.ADMIN } },
      },
      include: { Role: true },
    });
  }
  const userPermissions = await prisma.module.upsert({
    where: { name: 'User' },
    update: {
      permissions: {
        connectOrCreate: [
          {
            where: { key: 'user:create' },
            create: { action: 'CREATE', key: 'user:create' },
          },
          {
            where: { key: 'user:read' },
            create: { action: 'READ', key: 'user:read' },
          },
          {
            where: { key: 'user:update' },
            create: { action: 'UPDATE', key: 'user:update' },
          },
          {
            where: { key: 'user:delete' },
            create: { action: 'DELETE', key: 'user:delete' },
          },
        ],
      },
    },
    create: {
      name: 'User',
      permissions: {
        connectOrCreate: [
          {
            where: { key: 'user:create' },
            create: { action: 'CREATE', key: 'user:create' },
          },
          {
            where: { key: 'user:read' },
            create: { action: 'READ', key: 'user:read' },
          },
          {
            where: { key: 'user:update' },
            create: { action: 'UPDATE', key: 'user:update' },
          },
          {
            where: { key: 'user:delete' },
            create: { action: 'DELETE', key: 'user:delete' },
          },
        ],
      },
    },
    include: { permissions: true },
  });

  const adminRolePermissions = userPermissions.permissions.map(
    (permission) => ({
      permissionId: permission.id,
      moduleId: userPermissions.id,
    }),
  );
  const adminRoleId = admin.Role?.find(
    (r) => r.name === (Roles.ADMIN as string),
  )?.id;
  if (adminRoleId) {
    await prisma.role.update({
      where: { name: Roles.ADMIN },
      data: {
        rolePermissions: {
          connectOrCreate: adminRolePermissions.map((rp) => ({
            where: {
              roleId_permissionId: {
                roleId: adminRoleId,
                permissionId: rp.permissionId,
              },
            },
            create: rp,
          })),
        },
      },
    });
  }

  //   create super admin user and assign permissions
  let superAdmin = await prisma.user.findFirst({
    where: { email: 'superadmin@vbaccounts.com' },
    include: { Role: true },
  });
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@vbaccounts.com',
        password: await passwordService.hashPassword('superadmin123'),
        Role: { connect: { name: Roles.SUPER_ADMIN } },
      },
      include: { Role: true },
    });
  }
  const superAdminPermissions = await prisma.module.upsert({
    where: { name: 'Permissions' },
    update: {
      permissions: {
        connectOrCreate: [
          {
            where: { key: 'permission:read' },
            create: { action: 'READ', key: 'permission:read' },
          },
          {
            where: { key: 'permission:update' },
            create: { action: 'UPDATE', key: 'permission:update' },
          },
        ],
      },
    },
    create: {
      name: 'Permissions',
      permissions: {
        connectOrCreate: [
          {
            where: { key: 'permission:read' },
            create: { action: 'READ', key: 'permission:read' },
          },
          {
            where: { key: 'permission:update' },
            create: { action: 'UPDATE', key: 'permission:update' },
          },
        ],
      },
    },
    include: { permissions: true },
  });

  const superAdminRolePermissions = superAdminPermissions.permissions.map(
    (permission) => ({
      permissionId: permission.id,
      moduleId: superAdminPermissions.id,
    }),
  );

  const superAdminRoleId = superAdmin.Role?.find(
    (r) => r.name === (Roles.SUPER_ADMIN as string),
  )?.id;
  if (superAdminRoleId) {
    await prisma.role.update({
      where: { name: Roles.SUPER_ADMIN },
      data: {
        rolePermissions: {
          connectOrCreate: superAdminRolePermissions.map((rp) => ({
            where: {
              roleId_permissionId: {
                roleId: superAdminRoleId,
                permissionId: rp.permissionId,
              },
            },
            create: rp,
          })),
        },
      },
    });
  }

  //  create managers
  const managers = [
    {
      name: 'Captain Marvel',
      email: 'captain-marvel@gmail.com',
      country: 'India',
      password: await passwordService.hashPassword('manager123'),
      Role: { connect: { name: Roles.MANAGER } },
    },
    {
      name: 'Captain America',
      email: 'captain-america@gmail.com',
      country: 'America',
      password: await passwordService.hashPassword('manager123'),
      Role: { connect: { name: Roles.MANAGER } },
    },
  ];
  await Promise.all(
    managers.map((manager) =>
      prisma.user.upsert({
        where: { email: manager.email },
        update: {},
        create: {
          name: manager.name,
          email: manager.email,
          password: manager.password,
          country: manager.country,
          Role: manager.Role,
        },
      }),
    ),
  );

  // create team members
  const members = [
    {
      name: 'Thanos',
      email: 'thanos@gmail.com',
      country: 'India',
      password: await passwordService.hashPassword('member123'),
      Role: { connect: { name: Roles.MEMBER } },
    },
    {
      name: 'Thor',
      email: 'thor@gmail.com',
      country: 'India',
      password: await passwordService.hashPassword('member123'),
      Role: { connect: { name: Roles.MEMBER } },
    },
    {
      name: 'Travis',
      email: 'travis@gmail.com',
      country: 'America',
      password: await passwordService.hashPassword('member123'),
      Role: { connect: { name: Roles.MEMBER } },
    },
  ];
  await Promise.all(
    members.map((member) =>
      prisma.user.upsert({
        where: { email: member.email },
        update: {},
        create: {
          name: member.name,
          email: member.email,
          password: member.password,
          country: member.country,
          Role: member.Role,
        },
      }),
    ),
  );

  // create restaurants
  const menus = [
    {
      name: 'Arabian',
      items: {
        create: [
          {
            name: 'Mandhi',
            description: 'Delicious shawarma',
            price: 10,
            image: 'https://www.shutterstock.com/search/chicken-mandi-rice',
          },
          {
            name: 'Shawarma',
            description: 'Crispy falafel',
            price: 5,
            image:
              'https://www.freepik.com/free-photos-vectors/chicken-shawarma-wrap',
          },
        ],
      },
    },
    {
      name: 'Italian',
      items: {
        create: [
          {
            name: 'Pizza',
            description: 'Delicious pizza',
            price: 15,
            image:
              'https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg',
          },
          {
            name: 'Pasta',
            description: 'Delicious pasta',
            price: 12,
            image:
              'https://media.istockphoto.com/id/637214478/photo/pasta-plate.jpg?s=612x612&w=0&k=20&c=oebCQG_Zfv2zJpobSzpF6JFNdsBQUjG6MdQh-En5l3c=',
          },
        ],
      },
    },
  ];
  const restaurant1 = await prisma.restaurant.findFirst({
    where: { name: 'Restaurant 1' },
  });
  const restaurant2 = await prisma.restaurant.findFirst({
    where: { name: 'Restaurant 2' },
  });
  const restaurant3 = await prisma.restaurant.findFirst({
    where: { name: 'Restaurant 3' },
  });
  if (!restaurant1) {
    await prisma.restaurant.create({
      data: {
        name: 'Restaurant 1',
        country: 'India',
        menu: {
          create: menus,
        },
      },
    });
  }
  if (!restaurant2) {
    await prisma.restaurant.create({
      data: {
        name: 'Restaurant 2',
        country: 'America',
        menu: {
          create: menus,
        },
      },
    });
  }
  if (!restaurant3) {
    await prisma.restaurant.create({
      data: {
        name: 'Restaurant 3',
        country: 'India',
        menu: {
          create: menus,
        },
      },
    });
  }

  console.log('🌱 Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
