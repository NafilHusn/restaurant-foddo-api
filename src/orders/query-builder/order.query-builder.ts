import { Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import {
  CreateOrderDto,
  GetOrdersParamsDto,
  UpdateOrderDto,
} from '../dto/order.dto';
import { MenuItemService } from '../../menu/services/menu-item.service';
import { UserWithRole } from '../../auth/types/request-with-user';

@Injectable()
export class OrderQueryBuilder {
  constructor(private readonly menuItemService: MenuItemService) {}
  buildSelectQuery(): Prisma.OrderSelect {
    return {
      id: true,
      refNo: true,
      customerPhone: true,
      restaurant: true,
      status: true,
      cart: { include: { owner: true } },
      paymentMethod: true,
      paymentStatus: true,
      checkedOutBy: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: { id: true, quantity: true, price: true, menuItem: true },
      },
    };
  }

  buildListWhereQuery(
    params: GetOrdersParamsDto,
    user: UserWithRole,
  ): Prisma.OrderWhereInput {
    const AND: Prisma.OrderWhereInput[] = [];

    if (params.customerPhone) {
      AND.push({ customerPhone: params.customerPhone });
    }
    if (params.restaurantId) {
      AND.push({ restaurantId: params.restaurantId });
    }
    if (params.checkedOutById) {
      AND.push({ checkedOutById: params.checkedOutById });
    }
    if (params.status) {
      AND.push({ status: params.status });
    }
    if (params.paymentStatus) {
      AND.push({ paymentStatus: params.paymentStatus });
    }
    if (params.country) {
      AND.push({ restaurant: { country: params.country } });
    }

    if (params.fromDate || params.toDate) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (params.fromDate) {
        createdAt.gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        createdAt.lte = new Date(params.toDate);
      }
      AND.push({ createdAt });
    }
    if (
      user.Role.length > 0 &&
      user.Role.every((role) => role.name === RoleType.MEMBER)
    ) {
      AND.push({ cart: { ownerId: user.id } });
    }
    return { AND };
  }

  async buildCreateQuery(
    params: CreateOrderDto & { restaurantId: string },
    takenById?: string,
  ): Promise<Prisma.OrderCreateInput> {
    return {
      customerPhone: params.customerPhone,
      restaurant: { connect: { id: params.restaurantId } },
      paymentMethod: params.paymentMethod,
      checkedOutBy: { connect: { id: takenById } },
      cart: { connect: { id: params.cartId } },
      orderItems: {
        create:
          (await Promise.all(
            params.orderItems?.map(async (item) => {
              const menuItem = await this.menuItemService.findById(
                item.menuItemId,
              );

              if (!menuItem) {
                throw new Error(`Menu item ${item.menuItemId} not found`);
              }
              return {
                addedBy: { connect: { id: takenById } },
                menuItem: { connect: { id: item.menuItemId } },
                quantity: item.quantity,
                price: menuItem.price,
              };
            }),
          )) || [],
      },
    };
  }

  async buildUpdateQuery(
    params: UpdateOrderDto,
    takenById: string,
  ): Promise<Prisma.OrderUpdateInput> {
    const update: Prisma.OrderUpdateInput = {};
    if (params.status !== undefined) {
      update.status = params.status;
    }
    if (params.paymentStatus !== undefined) {
      update.paymentStatus = params.paymentStatus;
    }
    if (params.customerPhone !== undefined) {
      update.customerPhone = params.customerPhone;
    }
    if (params.paymentMethod !== undefined) {
      update.paymentMethod = params.paymentMethod;
    }
    if (params.orderItems !== undefined) {
      update.orderItems = {
        deleteMany: { orderId: params.id },
        create: await Promise.all(
          params.orderItems?.map(async (item) => {
            const menuItem = await this.menuItemService.findById(
              item.menuItemId,
            );

            if (!menuItem) {
              throw new Error(`Menu item ${item.menuItemId} not found`);
            }
            return {
              addedById: takenById,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem.price,
            };
          }),
        ),
      };
    }
    return update;
  }
}
