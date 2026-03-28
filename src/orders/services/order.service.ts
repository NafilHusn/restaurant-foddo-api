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
import { CartService } from '../../cart/service/cart.service';
import { UserWithRole } from '../../auth/types/request-with-user';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly queryBuilder: OrderQueryBuilder,
    private readonly orderValidator: OrderValidator,
    private readonly cartService: CartService,
  ) {}

  async findById(id: string) {
    const order = await this.orderRepo.findOne({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrder(updateData: UpdateOrderDto, takenById: string) {
    await this.orderValidator.isOrderExist(updateData.id);
    await this.orderValidator.isOrderEditable(updateData.id);

    const updateQuery = await this.queryBuilder.buildUpdateQuery(
      updateData,
      takenById,
    );
    await this.orderRepo.update(updateData.id, updateQuery);
    return { updated: true };
  }

  async createOrder(params: CreateOrderDto, userId: string, country?: string) {
    const restaurant = await this.orderValidator.isRestaurantExist(
      params.orderItems[0].menuItemId,
      country,
    );

    if (!params.orderItems || params.orderItems.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    await this.orderValidator.isItemRelatedToSameRestaurant(params.orderItems);

    params.cartId = await this.cartService.checkCartAccess(
      userId,
      params.cartId,
    );

    const createInput = await this.queryBuilder.buildCreateQuery(
      { ...params, restaurantId: restaurant.id },
      userId,
    );
    const order = await this.orderRepo.insert(createInput);
    await this.cartService.clearCart(userId, params.cartId);
    return { id: order.id };
  }

  async getAllOrders(params: GetOrdersParamsDto, user: UserWithRole) {
    const where = this.queryBuilder.buildListWhereQuery(params, user);
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
