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

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  @CreatedResponse()
  @PermissionGuard(['order:create'])
  @ProtectRoute()
  async create(@Body() dto: CreateOrderDto, @Req() req: RequestWithUser) {
    return await this.service.createOrder(dto, req.user.id);
  }

  @Put()
  @UpdatedResponse()
  @PermissionGuard(['order:update'])
  @ProtectRoute()
  async update(@Body() dto: UpdateOrderDto) {
    return await this.service.updateOrder(dto);
  }

  @Get()
  @ApiOkResponseWithData(OrderResponseDto, true)
  @PermissionGuard(['order:read'])
  @ProtectRoute()
  async list(@Query() params: GetOrdersParamsDto) {
    return await this.service.getAllOrders(params);
  }

  @Get(':id')
  @ApiOkResponseWithData(OrderResponseDto, false)
  @PermissionGuard(['order:read'])
  @ProtectRoute()
  async getById(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Delete()
  @DeletedResponse()
  @PermissionGuard(['order:delete'])
  @ProtectRoute()
  async delete(@Query() params: DeleteOrderDto) {
    return await this.service.deleteOrder(params.id);
  }
}
