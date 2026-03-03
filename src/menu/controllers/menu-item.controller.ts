import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MenuItemService } from '../services/menu-item.service';
import {
  CreateMenuItemDto,
  DeleteMenuItemDto,
  GetMenuItemsParamsDto,
  MenuItemResponseDto,
  UpdateMenuItemDto,
} from '../dto/menu-item.dto';
import { ProtectRoute } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../permission/guards/permission.guard';
import { ApiOkResponseWithData } from '../../../utils/decorators/ResponseFormat';
import { CreatedResponse } from '../../../utils/decorators/CreatedResponse';
import { DeletedResponse } from '../../../utils/decorators/DeletedResponse';
import { UpdatedResponse } from '../../../utils/decorators/UpdatedResponse';
import { FileField, ReceiveFile } from '../../../utils/multer.helper';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly service: MenuItemService) {}

  @Post()
  @CreatedResponse()
  @ReceiveFile('image', 1)
  @PermissionGuard(['menu-item:create'])
  @ProtectRoute()
  async create(
    @Body() dto: CreateMenuItemDto,
    @FileField('image') file: Express.Multer.File,
  ) {
    return await this.service.createItem(dto, file);
  }

  @Put()
  @UpdatedResponse()
  @ReceiveFile('image')
  @PermissionGuard(['menu-item:update'])
  @ProtectRoute()
  async update(
    @Body() dto: UpdateMenuItemDto,
    @FileField('image') file?: Express.Multer.File,
  ) {
    return await this.service.updateItem(dto, file);
  }

  @Get()
  @ApiOkResponseWithData(MenuItemResponseDto, true)
  @PermissionGuard(['menu-item:read'])
  @ProtectRoute()
  async list(@Query() params: GetMenuItemsParamsDto) {
    return await this.service.getAllItems(params);
  }

  @Delete()
  @DeletedResponse()
  @PermissionGuard(['menu-item:delete'])
  @ProtectRoute()
  async delete(@Query() params: DeleteMenuItemDto) {
    return await this.service.deleteItem(params.id);
  }
}
