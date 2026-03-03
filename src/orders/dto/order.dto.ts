import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  ValidateNested,
} from 'class-validator';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Limit, Skip } from '../../../utils/pagination.helper';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { OptionalDate } from '../../../utils/date.helper';
import {
  OptionalString,
  UUIDString,
  UUIDStringOptional,
} from '../../../utils/string.helper';
import { NotEmptyNumber } from '../../../utils/number.helper';

export class OrderItemDto {
  @UUIDString()
  menuItemId: string;

  @NotEmptyNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsPhoneNumber('IN')
  @OptionalString()
  customerPhone?: string;

  @UUIDString()
  restaurantId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({ type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @UUIDString()
  id: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}

export class GetOrdersParamsDto {
  @OptionalString()
  customerPhone?: string;

  @UUIDStringOptional()
  restaurantId?: string;

  @UUIDStringOptional()
  takenById?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @OptionalDate()
  fromDate?: string;

  @OptionalDate()
  toDate?: string;

  @Limit()
  limit: number;

  @Skip()
  skip: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  restaurantId: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  takenById: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DeleteOrderDto {
  @UUIDString()
  id: string;
}
