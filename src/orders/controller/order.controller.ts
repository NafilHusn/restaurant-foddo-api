import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import {
  CreateOrderDto,
  DeleteOrderDto,
  GetOrdersParamsDto,
  OrderResponseDto,
  UpdateOrderDto,
} from '../dto/order.dto';
import { ProtectRoute } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../permission/guards/permission.guard';
import { ApiOkResponseWithData } from '../../../utils/decorators/ResponseFormat';
import { CreatedResponse } from '../../../utils/decorators/CreatedResponse';
import { DeletedResponse } from '../../../utils/decorators/DeletedResponse';
import { UpdatedResponse } from '../../../utils/decorators/UpdatedResponse';
import type { RequestWithUser } from '../../auth/types/request-with-user';
import { FieldPermission } from '../../permission/guards/field-permission.guard';
import { ORDER_FIELD_PERMISSIONS } from '../constants/order.constants';
import {
  CountryScope,
  WithCountryScope,
} from '../../users/interceptors/country-scoper.interceptor';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  @CreatedResponse()
  @PermissionGuard(['order:create'])
  @ProtectRoute()
  async create(@Body() dto: CreateOrderDto, @Req() req: RequestWithUser) {
    return await this.service.createOrder(
      dto,
      req.user.id,
      req.user.country ?? undefined,
    );
  }

  @Put()
  @UpdatedResponse()
  @FieldPermission(ORDER_FIELD_PERMISSIONS)
  @PermissionGuard(['order:update'])
  @ProtectRoute()
  async update(@Body() dto: UpdateOrderDto, @Req() req: RequestWithUser) {
    return await this.service.updateOrder(dto, req.user.id);
  }

  @Get()
  @ApiOkResponseWithData(OrderResponseDto, true)
  @WithCountryScope()
  @PermissionGuard(['order:read'])
  @ProtectRoute()
  async list(
    @Query() params: GetOrdersParamsDto,
    @CountryScope() countryScope: string,
    @Req() req: RequestWithUser,
  ) {
    if (countryScope) {
      params.country = countryScope;
    }
    return await this.service.getAllOrders(params, req.user);
  }

  @Get(':id')
  @ApiOkResponseWithData(OrderResponseDto, false)
  @PermissionGuard(['order:read'])
  @ProtectRoute()
  async getById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { data };
  }

  @Delete()
  @DeletedResponse()
  @PermissionGuard(['order:delete'])
  @ProtectRoute()
  async delete(@Query() params: DeleteOrderDto) {
    return await this.service.deleteOrder(params.id);
  }
}
