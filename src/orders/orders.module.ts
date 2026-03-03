import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderQueryBuilder } from './query-builder/order.query-builder';
import { OrderController } from './controller/order.controller';
import { DatabaseModule } from '../../utils/db/db.module';
import { OrderValidator } from './validators/order.validator';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [DatabaseModule, RestaurantModule],
  controllers: [OrderController],
  providers: [OrderService, OrderQueryBuilder, OrderRepository, OrderValidator],
  exports: [OrderService],
})
export class OrderModule {}
