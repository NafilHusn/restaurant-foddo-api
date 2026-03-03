import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMenuItemDto, GetMenuItemsParamsDto } from '../dto/menu-item.dto';

@Injectable()
export class MenuItemQueryBuilder {
  buildCheckExistingItemQuery(
    name: string,
    categoryId: string,
    id?: string,
  ): Prisma.MenuItemsWhereInput {
    const where: Prisma.MenuItemsWhereInput = {
      deletedAt: null,
      name,
      categoryId,
    };
    if (id) where.id = { not: id };
    return where;
  }

  buildCreateQuery(
    params: CreateMenuItemDto,
    imageUrl: string,
  ): Prisma.MenuItemsCreateInput {
    return {
      name: params.name,
      description: params.description,
      price: params.price,
      image: imageUrl,
      category: { connect: { id: params.categoryId } },
    };
  }

  buildListWhereQuery(
    params: Omit<GetMenuItemsParamsDto, 'limit' | 'skip'>,
  ): Prisma.MenuItemsWhereInput {
    const { categoryId, search } = params;
    const AND: Prisma.MenuItemsWhereInput[] = [{ deletedAt: null }];

    if (categoryId) AND.push({ categoryId });
    if (search)
      AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    return { AND };
  }

  buildSelectQuery() {
    return {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      categoryId: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.MenuItemsSelect;
  }
}
