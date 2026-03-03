import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateOrderDto,
  GetOrdersParamsDto,
  UpdateOrderDto,
} from '../dto/order.dto';

@Injectable()
export class OrderQueryBuilder {
  buildSelectQuery(): Prisma.OrderSelect {
    return {
      id: true,
      customerPhone: true,
      restaurantId: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      takenById: true,
      createdAt: true,
      updatedAt: true,
      orderItems: true,
    };
  }

  buildListWhereQuery(params: GetOrdersParamsDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (params.customerPhone) {
      where.customerPhone = params.customerPhone;
    }
    if (params.restaurantId) {
      where.restaurantId = params.restaurantId;
    }
    if (params.takenById) {
      where.takenById = params.takenById;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.paymentStatus) {
      where.paymentStatus = params.paymentStatus;
    }

    if (params.fromDate || params.toDate) {
      where.createdAt = {};
      if (params.fromDate) {
        where.createdAt.gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        where.createdAt.lte = new Date(params.toDate);
      }
    }

    return where;
  }

  buildCreateQuery(
    params: CreateOrderDto,
    takenById?: string,
  ): Prisma.OrderCreateInput {
    return {
      customerPhone: params.customerPhone,
      restaurantId: params.restaurantId,
      paymentMethod: params.paymentMethod,
      takenBy: { connect: { id: takenById } },
      orderItems: {
        create:
          params.orderItems?.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })) || [],
      },
    };
  }

  buildUpdateQuery(params: UpdateOrderDto): Prisma.OrderUpdateInput {
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
        create: params.orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };
    }
    if (params.restaurantId !== undefined) {
      update.restaurantId = params.restaurantId;
    }
    return update;
  }
}
