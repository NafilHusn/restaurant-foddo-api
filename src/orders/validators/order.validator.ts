import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { OrderStatus } from '@prisma/client';
import { OrderItemDto } from '../dto/order.dto';
import { MenuItemService } from '../../menu/services/menu-item.service';

@Injectable()
export class OrderValidator {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly restaurantService: RestaurantService,
    private readonly menuItemService: MenuItemService,
  ) {}

  async isRestaurantExist(menuItemId: string, country?: string) {
    const restaurant = await this.restaurantService.findOne({
      menu: { some: { items: { some: { id: menuItemId } } } },
      country,
    });
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

  async isOrderEditable(id: string) {
    const order = await this.isOrderExist(id);
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.ACCEPTED
    ) {
      throw new BadRequestException('Order is not editable');
    }
    return order;
  }

  async isItemRelatedToSameRestaurant(items: OrderItemDto[]) {
    const menuItems = await this.restaurantService.findAll({
      menu: {
        some: {
          items: { some: { id: { in: items.map((item) => item.menuItemId) } } },
        },
      },
    });
    if (menuItems.length > 1) {
      throw new BadRequestException(
        'All menu items must belong to the same restaurant',
      );
    }
    return menuItems;
  }
}
