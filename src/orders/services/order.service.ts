import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderQueryBuilder } from '../query-builder/order.query-builder';
import {
  CreateOrderDto,
  GetOrdersParamsDto,
  UpdateOrderDto,
} from '../dto/order.dto';
import { OrderValidator } from '../validators/order.validator';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly queryBuilder: OrderQueryBuilder,
    private readonly orderValidator: OrderValidator,
  ) {}

  async findById(id: string) {
    const order = await this.orderRepo.findOne({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrder(updateData: UpdateOrderDto) {
    await this.orderValidator.isOrderExist(updateData.id);

    const updateQuery = this.queryBuilder.buildUpdateQuery(updateData);
    await this.orderRepo.update(updateData.id, updateQuery);
    return { updated: true };
  }

  async createOrder(params: CreateOrderDto, userId: string) {
    await this.orderValidator.isRestaurantExist(params.restaurantId);

    if (!params.orderItems || params.orderItems.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const createInput = this.queryBuilder.buildCreateQuery(params, userId);
    const order = await this.orderRepo.insert(createInput);
    return { id: order.id };
  }

  async getAllOrders(params: GetOrdersParamsDto) {
    const where = this.queryBuilder.buildListWhereQuery(params);
    const [data, total] = await Promise.all([
      this.orderRepo.findMany(where, params.skip, params.limit),
      this.orderRepo.count(where),
    ]);
    return {
      data,
      total,
    };
  }

  async deleteOrder(id: string) {
    await this.orderValidator.isOrderExist(id);
    await this.orderRepo.delete(id);
    return { deleted: true };
  }
}
