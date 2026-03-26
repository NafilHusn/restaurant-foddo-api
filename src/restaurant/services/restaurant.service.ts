import { Injectable } from '@nestjs/common';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { RestaurantQueryBuilder } from '../query-builder/restaurant.query-builder';
import {
  CreateRestaurantDto,
  GetRestaurantsParamsDto,
  UpdateRestaurantDto,
} from '../dto/restaurant.dto';
import { RestaurantValidator } from '../validators/restaurant.validator';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly restaurantRepo: RestaurantRepository,
    private readonly queryBuilder: RestaurantQueryBuilder,
    private readonly restaurantValidator: RestaurantValidator,
  ) {}

  async findById(id: string, country?: string) {
    return await this.restaurantRepo.findOne({ id, country });
  }

  async updateRestaurant(updateData: UpdateRestaurantDto) {
    if (updateData.name) {
      await this.restaurantValidator.isExistingRestaurant(
        updateData.name,
        updateData.id,
      );
    }
    await this.restaurantRepo.update(updateData.id, updateData);
    return { updated: true };
  }

  async createRestaurant(params: CreateRestaurantDto) {
    await this.restaurantValidator.isExistingRestaurant(params.name);

    const createInput = this.queryBuilder.buildCreateQuery(params);
    const restaurant = await this.restaurantRepo.insert(createInput);
    return { id: restaurant.id };
  }

  async getAllRestaurants(params: GetRestaurantsParamsDto) {
    const where = this.queryBuilder.buildListWhereQuery(params);
    const [data, total] = await Promise.all([
      this.restaurantRepo.findMany(where, params.skip, params.limit),
      this.restaurantRepo.count(where),
    ]);
    return {
      data,
      total,
    };
  }

  async deleteRestaurant(id: string) {
    await this.restaurantRepo.delete(id);
    return { deleted: true };
  }

  async findAll(where: Prisma.RestaurantWhereInput) {
    return await this.restaurantRepo.findMany(where);
  }

  async findOne(where: Prisma.RestaurantWhereInput) {
    return await this.restaurantRepo.findOne(where);
  }
}
