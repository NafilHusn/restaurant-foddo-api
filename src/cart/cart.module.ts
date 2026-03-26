import { Module } from '@nestjs/common';
import { DatabaseModule } from 'utils/db/db.module';
import { CartController } from './controller/cart.controller';
import { CartService } from './service/cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartQueryBuilder } from './query-builder/cart.query.builder';

@Module({
  imports: [DatabaseModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartQueryBuilder],
  exports: [CartService],
})
export class CartModule {}
