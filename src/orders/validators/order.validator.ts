import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { RestaurantService } from '../../restaurant/services/restaurant.service';

@Injectable()
export class OrderValidator {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly restaurantService: RestaurantService,
  ) {}

  async isRestaurantExist(id: string) {
    const restaurant = await this.restaurantService.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async isOrderExist(id: string) {
    const order = await this.orderRepo.findOne({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
