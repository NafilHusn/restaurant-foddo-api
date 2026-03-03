import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { MenuItemQueryBuilder } from '../query-builder/menu-item.query-builder';
import {
  CreateMenuItemDto,
  GetMenuItemsParamsDto,
  UpdateMenuItemDto,
} from '../dto/menu-item.dto';
import { MenuValidator } from '../validators/menu.validator';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import type { IUploadService } from '../../../utils/file-upload/IUploadService';
import { IUploadServiceToken } from '../../../utils/file-upload/IUploadService';
import { ALLOWED_IMAGE_TYPES } from '../../../utils/file-upload/upload.constants';

@Injectable()
export class MenuItemService {
  constructor(
    private readonly itemRepo: MenuItemRepository,
    private readonly queryBuilder: MenuItemQueryBuilder,
    private readonly menuValidator: MenuValidator,
    private readonly categoryRepo: MenuCategoryRepository,

    @Inject(IUploadServiceToken)
    private readonly uploadService: IUploadService,
  ) {}

  private async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploaded = await this.uploadService.uploadFile(
      file,
      '/client',
      ALLOWED_IMAGE_TYPES,
    );
    return uploaded.path;
  }

  async findById(id: string) {
    return await this.itemRepo.findOne({ id });
  }

  async updateItem(updateData: UpdateMenuItemDto, file?: Express.Multer.File) {
    const existingItem = await this.findById(updateData.id);
    if (!existingItem) throw new BadRequestException('Menu item not found');

    if (updateData.name) {
      await this.menuValidator.isExistingItem(
        updateData.name,
        existingItem.categoryId,
        updateData.id,
      );
    }

    let imageUrl = existingItem.image;
    if (file) {
      imageUrl = await this.uploadFile(file);
    }

    await this.itemRepo.update(updateData.id, {
      ...updateData,
      image: imageUrl,
    });
    return { updated: true };
  }

  async createItem(params: CreateMenuItemDto, file: Express.Multer.File) {
    const category = await this.categoryRepo.findOne({ id: params.categoryId });
    if (!category) throw new BadRequestException('Menu category not found');

    await this.menuValidator.isExistingItem(params.name, params.categoryId);

    const imageUrl = await this.uploadFile(file);

    const createInput = this.queryBuilder.buildCreateQuery(params, imageUrl);
    const item = await this.itemRepo.insert(createInput);
    return { id: item.id };
  }

  async getAllItems(params: GetMenuItemsParamsDto) {
    const where = this.queryBuilder.buildListWhereQuery(params);
    const [data, total] = await Promise.all([
      this.itemRepo.findMany(where, params.skip, params.limit),
      this.itemRepo.count(where),
    ]);
    return {
      data,
      total,
    };
  }

  async deleteItem(id: string) {
    const item = await this.findById(id);
    if (!item) throw new BadRequestException('Menu item not found');

    await this.itemRepo.delete(id);
    return { deleted: true };
  }
}
