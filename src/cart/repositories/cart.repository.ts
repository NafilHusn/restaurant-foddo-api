import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import DatabaseService from 'utils/db/db.service';

@Injectable()
export class CartRepository {
  constructor(private readonly db: DatabaseService) {}

  // Cart
  async findOneCart(
    where: Prisma.CartWhereUniqueInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartInclude,
  ) {
    return await tx.cart.findUnique({ where, include });
  }

  async createCart(
    data: Prisma.CartCreateInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartInclude,
  ) {
    return await tx.cart.create({ data, include });
  }

  // CartItem
  async findOneCartItem(
    where: Prisma.CartItemWhereUniqueInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartItemInclude,
  ) {
    return await tx.cartItem.findUnique({ where, include });
  }

  async findCartItems(
    where: Prisma.CartItemWhereInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartItemInclude,
  ) {
    return await tx.cartItem.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCartItem(
    data: Prisma.CartItemUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartItem.create({ data });
  }

  async updateCartItem(
    where: Prisma.CartItemWhereUniqueInput,
    data: Prisma.CartItemUpdateInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartItem.update({ where, data });
  }

  async deleteCartItem(
    where: Prisma.CartItemWhereUniqueInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartItem.delete({ where });
  }

  async deleteManyCartItems(
    where: Prisma.CartItemWhereInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartItem.deleteMany({ where });
  }

  // CartShare
  async findOneCartShare(
    where: Prisma.CartShareWhereUniqueInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartShareInclude,
  ) {
    return await tx.cartShare.findUnique({ where, include });
  }

  async findCartShares(
    where: Prisma.CartShareWhereInput,
    tx: Prisma.TransactionClient = this.db,
    include?: Prisma.CartShareInclude,
  ) {
    return await tx.cartShare.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createManyCartShares(
    data: Prisma.CartShareCreateManyInput[],
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartShare.createMany({ data, skipDuplicates: true });
  }

  async updateCartShare(
    where: Prisma.CartShareWhereUniqueInput,
    data: Prisma.CartShareUpdateInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartShare.update({ where, data });
  }

  async deleteCartShare(
    where: Prisma.CartShareWhereUniqueInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartShare.delete({ where });
  }

  async deleteManyCartShares(
    where: Prisma.CartShareWhereInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.cartShare.deleteMany({ where });
  }

  // Order
  async createOrder(
    data: Prisma.OrderUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.order.create({ data });
  }

  async createManyOrderItems(
    data: Prisma.OrderItemUncheckedCreateInput[],
    tx: Prisma.TransactionClient = this.db,
  ) {
    return await tx.orderItem.createMany({ data });
  }
}
