import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItem, CartShare, ShareRole } from '@prisma/client';
import {
  AddCartItemDto,
  CheckoutCartDto,
  ShareCartItemDto,
} from '../dto/cart.dto';
import { CartRepository } from '../repositories/cart.repository';
import { CartQueryBuilder } from '../query-builder/cart.query.builder';
import TransactionService from '../../../utils/db/transaction.service';
import { UserService } from '../../users/services/users.service';

@Injectable()
export class CartService {
  constructor(
    private readonly repo: CartRepository,
    private readonly builder: CartQueryBuilder,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  async getOwnCart(userId: string) {
    const where = this.builder.buildCartWhereOwnerId(userId);
    let cart = await this.repo.findOneCart(where);
    if (!cart) {
      const data = this.builder.buildCartCreateQuery(userId);
      cart = await this.repo.createCart(data);
    }
    return cart;
  }

  async getCartAccess(userId: string, cartId: string) {
    const where = this.builder.buildCartWhereId(cartId);
    const cart = await this.repo.findOneCart(where);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.ownerId === userId) {
      return { cart, role: 'OWNER', share: null };
    }

    const shareWhere = this.builder.buildCartShareWhereUnique(cartId, userId);
    const share = await this.repo.findOneCartShare(shareWhere);

    if (!share) {
      throw new ForbiddenException('You do not have access to this cart');
    }

    return { cart, role: share.role, share };
  }

  async checkCartAccess(userId: string, cartId?: string) {
    if (!cartId) {
      const ownCart = await this.getOwnCart(userId);
      return ownCart.id;
    }
    const access = await this.getCartAccess(userId, cartId);
    if (access.role !== 'OWNER' && access.role !== ShareRole.CHECKOUT_ALLOWED) {
      throw new ForbiddenException(
        'You do not have permission to checkout this cart',
      );
    }
    return access.cart.id;
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    let targetCartId = dto.cartId;
    let isSharedAccess = false;
    let shareRecord: CartShare | null = null;

    if (targetCartId) {
      const access = await this.getCartAccess(userId, targetCartId);
      isSharedAccess = access.role !== 'OWNER';
      shareRecord = access.share;
    } else {
      const ownCart = await this.getOwnCart(userId);
      targetCartId = ownCart.id;
    }

    const existingWhere = this.builder.buildCartItemWhereUnique(
      targetCartId,
      dto.menuItemId,
    );
    const existingItem = await this.repo.findOneCartItem(existingWhere);

    return await this.transactionService.runTransaction(async (tx) => {
      let cartItem: CartItem;

      if (existingItem) {
        const updateWhere = this.builder.buildCartItemWhereId(existingItem.id);
        const updateData = this.builder.buildCartItemUpdateQuantityQuery(
          dto.quantity,
        );
        cartItem = await this.repo.updateCartItem(updateWhere, updateData, tx);
      } else {
        const createData = this.builder.buildCartItemCreateQuery(
          targetCartId,
          dto.menuItemId,
          dto.quantity,
          userId,
        );
        cartItem = await this.repo.createCartItem(createData, tx);
      }

      if (isSharedAccess && shareRecord && !shareRecord.hasContributed) {
        const updateShareWhere = this.builder.buildCartShareWhereUnique(
          shareRecord.cartId,
          shareRecord.userId,
        );
        const updateShareData =
          this.builder.buildCartShareUpdateContributedQuery();
        await this.repo.updateCartShare(updateShareWhere, updateShareData, tx);
      }

      return { data: cartItem };
    });
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const where = this.builder.buildCartItemWhereId(itemId);
    const item = await this.repo.findOneCartItem(where);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.getCartAccess(userId, item.cartId);

    const updateData = this.builder.buildCartItemUpdateQuantityQuery(quantity);
    return await this.repo.updateCartItem(where, updateData);
  }

  async deleteItem(userId: string, itemId: string) {
    const where = this.builder.buildCartItemWhereId(itemId);
    const item = await this.repo.findOneCartItem(where);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.getCartAccess(userId, item.cartId);
    await this.repo.deleteCartItem(where);

    return { deleted: true };
  }

  async clearCart(userId: string, cartId: string) {
    await this.getCartAccess(userId, cartId);
    await this.repo.deleteManyCartItems({ cartId });
    return { deleted: true };
  }

  async getCartItems(userId: string, targetCartId?: string) {
    let cartIdToQuery = targetCartId;
    if (targetCartId) {
      await this.getCartAccess(userId, targetCartId);
    } else {
      const ownCart = await this.getOwnCart(userId);
      cartIdToQuery = ownCart.id;
    }

    const where = this.builder.buildCartItemWhereCart(cartIdToQuery!);
    const include = this.builder.buildCartItemIncludeQuery();
    const data = await this.repo.findCartItems(where, undefined, include);
    return { data, total: data.length };
  }

  async shareCart(ownerId: string, users: ShareCartItemDto[]) {
    return await this.transactionService.runTransaction(async (tx) => {
      const cart = await this.getOwnCart(ownerId);
      const validUserIds = users.filter(({ userId }) => userId !== ownerId);

      const data = validUserIds.map((user) => ({
        cartId: cart.id,
        userId: user.userId,
        role: user.role,
        hasContributed: false,
      }));

      await this.repo.deleteManyCartShares(
        {
          cartId: cart.id,
          userId: { in: validUserIds.map((user) => user.userId) },
        },
        tx,
      );

      await this.repo.createManyCartShares(data, tx);

      return { shared: true };
    });
  }

  async removeSharedUser(ownerId: string, sharedUserId: string) {
    const cart = await this.getOwnCart(ownerId);

    const shareWhere = this.builder.buildCartShareWhereUnique(
      cart.id,
      sharedUserId,
    );
    const share = await this.repo.findOneCartShare(shareWhere);

    if (!share) {
      throw new NotFoundException('User is not sharing this cart');
    }

    if (share.hasContributed) {
      throw new BadRequestException(
        'Cannot remove user who has contributed to the cart',
      );
    }

    await this.repo.deleteCartShare(shareWhere);

    return { removed: true };
  }

  async getSharedUsers(userId: string) {
    const cart = await this.getOwnCart(userId);
    const where = this.builder.buildCartShareWhereCart(cart.id);
    const include = this.builder.buildCartShareUserInclude();

    const data = await this.repo.findCartShares(where, undefined, include);
    return { data, total: data.length };
  }

  async getSharedCarts(userId: string) {
    const where = this.builder.buildCartShareWhereUser(userId);
    const include = this.builder.buildCartShareCartInclude(userId);

    const data = await this.repo.findCartShares(where, undefined, include);
    return { data, total: data.length };
  }

  async getSharableUsers(userId: string, country?: string) {
    const { where, select } = this.builder.buildSharableUsersQuery(
      userId,
      country,
    );
    const users = await this.userService.findAll(where, select, {
      cartShares: { _count: 'desc' },
    });
    return { data: users, total: users.length };
  }

  async checkoutCart(userId: string, dto: CheckoutCartDto) {
    let cartIdToCheckout = dto.cartId;
    if (dto.cartId) {
      const access = await this.getCartAccess(userId, dto.cartId);
      if (
        access.role !== 'OWNER' &&
        access.role !== ShareRole.CHECKOUT_ALLOWED
      ) {
        throw new ForbiddenException(
          'You do not have permission to checkout this cart',
        );
      }
    } else {
      const ownCart = await this.getOwnCart(userId);
      cartIdToCheckout = ownCart.id;
    }

    return await this.transactionService.runTransaction(async (tx) => {
      const whereCart = this.builder.buildCartItemWhereCart(cartIdToCheckout);
      const cartItems = await this.repo.findCartItems(whereCart, tx);

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const orderData = this.builder.buildOrderCreateQuery(
        cartIdToCheckout,
        userId,
        dto.restaurantId,
      );
      const order = await this.repo.createOrder(orderData, tx);

      const orderItemsData = cartItems.map((item) => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        addedById: item.addedBy,
        quantity: item.quantity,
      }));

      await this.repo.createManyOrderItems(orderItemsData, tx);

      const deleteCartItemsWhere =
        this.builder.buildCartItemWhereCart(cartIdToCheckout);
      await this.repo.deleteManyCartItems(deleteCartItemsWhere, tx);

      const deleteSharesWhere =
        this.builder.buildCartShareWhereCart(cartIdToCheckout);
      await this.repo.deleteManyCartShares(deleteSharesWhere, tx);

      return order;
    });
  }
}
