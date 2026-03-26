import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from '../../roles/decorators/roles.decorator';
import { Roles } from '../../roles/constants/role.constants';

@Injectable()
export class CartQueryBuilder {
  // Cart
  buildCartWhereOwnerId(ownerId: string): Prisma.CartWhereUniqueInput {
    return { ownerId };
  }

  buildCartWhereId(id: string): Prisma.CartWhereUniqueInput {
    return { id };
  }

  buildCartCreateQuery(ownerId: string): Prisma.CartCreateInput {
    return { owner: { connect: { id: ownerId } } };
  }

  // CartItem
  buildCartItemWhereUnique(
    cartId: string,
    menuItemId: string,
  ): Prisma.CartItemWhereUniqueInput {
    return { cartId_menuItemId: { cartId, menuItemId } };
  }

  buildCartItemWhereId(id: string): Prisma.CartItemWhereUniqueInput {
    return { id };
  }

  buildCartItemWhereCart(cartId: string): Prisma.CartItemWhereInput {
    return { cartId };
  }

  buildCartItemCreateQuery(
    cartId: string,
    menuItemId: string,
    quantity: number,
    addedBy: string,
  ): Prisma.CartItemUncheckedCreateInput {
    return { cartId, menuItemId, quantity, addedBy };
  }

  buildCartItemUpdateQuantityQuery(
    quantity: number,
  ): Prisma.CartItemUpdateInput {
    return { quantity };
  }

  buildCartItemIncludeQuery(): Prisma.CartItemInclude {
    return {
      menuItem: true,
      addedByUser: {
        select: { id: true, name: true, email: true },
      },
    };
  }

  // CartShare
  buildCartShareWhereUnique(
    cartId: string,
    userId: string,
  ): Prisma.CartShareWhereUniqueInput {
    return { cartId_userId: { cartId, userId } };
  }

  buildCartShareWhereCart(cartId: string): Prisma.CartShareWhereInput {
    return { cartId };
  }

  buildCartShareWhereUser(userId: string): Prisma.CartShareWhereInput {
    return { userId };
  }

  buildCartShareUpdateContributedQuery(): Prisma.CartShareUpdateInput {
    return { hasContributed: true };
  }

  buildCartShareUserInclude(): Prisma.CartShareInclude {
    return {
      user: {
        select: { id: true, name: true, email: true },
      },
    };
  }

  buildCartShareCartInclude(userId: string): Prisma.CartShareInclude {
    return {
      cart: {
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          items: {
            where: {
              addedBy: userId,
            },
            include: {
              menuItem: true,
              addedByUser: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    };
  }

  // Order
  buildOrderCreateQuery(
    cartId: string,
    checkedOutBy: string,
    restaurantId: string,
  ): Prisma.OrderUncheckedCreateInput {
    return { cartId, checkedOutById: checkedOutBy, restaurantId };
  }

  buildSharableUsersQuery(
    userId: string,
    country?: string,
  ): { where: Prisma.UserWhereInput; select: Prisma.UserSelect } {
    const where = {
      id: {
        not: userId,
      },
      Role: {
        some: {
          name: {
            notIn: [Roles.ADMIN, Roles.SUPER_ADMIN],
          },
        },
      },
      ...(country && { country }),
    };

    const select: Prisma.UserSelect = {
      id: true,
      name: true,
      email: true,
      Role: true,
      profilePicture: true,
      cartShares: {
        where: {
          cart: {
            ownerId: userId,
          },
        },
        select: {
          id: true,
          hasContributed: true,
          role: true,
        },
      },
      sharedItems: {
        select: {
          id: true,
          quantity: true,
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
            },
          },
        },
        where: {
          cart: {
            ownerId: userId,
          },
        },
      },
    };

    return { where, select };
  }
}
