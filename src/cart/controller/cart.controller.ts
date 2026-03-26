import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user';
import type { UserWithRole } from 'src/auth/types/request-with-user';
import { ProtectRoute } from 'src/auth/guards/auth.guard';
import { CartService } from '../service/cart.service';
import {
  AddCartItemDto,
  CheckoutCartDto,
  ShareCartDto,
  UpdateCartItemQuantityDto,
} from '../dto/cart.dto';
import { CreatedResponse } from 'utils/decorators/CreatedResponse';
import { UpdatedResponse } from 'utils/decorators/UpdatedResponse';
import { DeletedResponse } from 'utils/decorators/DeletedResponse';
import { ApiOkResponseWithData } from 'utils/decorators/ResponseFormat';
import { ApiQuery } from '@nestjs/swagger';

@Controller('cart')
@ProtectRoute()
export class CartController {
  constructor(private readonly service: CartService) {}

  @Post('items')
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.addItem(user.id, dto);
  }

  @Patch('items/:itemId')
  @UpdatedResponse()
  async updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemQuantityDto,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.updateItemQuantity(user.id, itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  @DeletedResponse()
  async deleteItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.deleteItem(user.id, itemId);
  }

  @Get('items')
  @ApiOkResponseWithData(Object, true)
  @ApiQuery({
    name: 'cartId',
    required: false,
    description: 'Cart ID',
  })
  async getCartItems(
    @CurrentUser() user: UserWithRole,
    @Query('cartId') cartId?: string,
  ) {
    return await this.service.getCartItems(user.id, cartId);
  }

  @Post('share')
  @CreatedResponse()
  async shareCart(
    @Body() dto: ShareCartDto,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.shareCart(user.id, dto.users);
  }

  @Get('share')
  @ApiOkResponseWithData(Object, true)
  async getSharedUsers(@CurrentUser() user: UserWithRole) {
    return await this.service.getSharedUsers(user.id);
  }

  @Delete('share/:userId')
  @DeletedResponse()
  async removeSharedUser(
    @Param('userId') sharedUserId: string,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.removeSharedUser(user.id, sharedUserId);
  }

  @Get('shared')
  @ApiOkResponseWithData(Object, true)
  async getSharedCarts(@CurrentUser() user: UserWithRole) {
    return await this.service.getSharedCarts(user.id);
  }

  @Get('sharable-users')
  @ApiOkResponseWithData(Object, true)
  async getSharableUsers(@CurrentUser() user: UserWithRole) {
    return await this.service.getSharableUsers(
      user.id,
      user.country ?? undefined,
    );
  }

  @Post('checkout')
  @CreatedResponse()
  async checkoutCart(
    @Body() dto: CheckoutCartDto,
    @CurrentUser() user: UserWithRole,
  ) {
    return await this.service.checkoutCart(user.id, dto);
  }
}
