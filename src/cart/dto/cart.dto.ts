import { ApiProperty } from '@nestjs/swagger';
import { ShareRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import {
  OptionalString,
  UUIDString,
  UUIDStringOptional,
} from 'utils/string.helper';
import { NotEmptyArray } from '../../../utils/array.helper';

export class AddCartItemDto {
  @UUIDString()
  menuItemId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ description: 'Quantity of the item' })
  quantity: number;

  @UUIDStringOptional()
  cartId?: string;
}

export class UpdateCartItemQuantityDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ description: 'Quantity of the item (must be > 0)' })
  quantity: number;
}

export class ShareCartItemDto {
  @OptionalString({ enum: ShareRole })
  role?: ShareRole;

  @UUIDString()
  userId: string;
}

export class ShareCartDto {
  @NotEmptyArray({ type: [ShareCartItemDto] })
  @Type(() => ShareCartItemDto)
  users: ShareCartItemDto[];
}

export class CheckoutCartDto {
  @UUIDString()
  cartId: string;

  @UUIDString()
  restaurantId: string;
}
