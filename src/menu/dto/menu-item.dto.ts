import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  NotEmptyString,
  OptionalString,
  UUIDString,
} from '../../../utils/string.helper';
import { Limit, Skip } from '../../../utils/pagination.helper';
import { IsBoolean, IsOptional } from 'class-validator';
import { OptionalDecimal } from '../../../utils/number.helper';

export class CreateMenuItemDto {
  @NotEmptyString()
  name: string;

  @OptionalString()
  description?: string;

  @OptionalDecimal()
  price: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image: Express.Multer.File;

  @UUIDString()
  categoryId: string;
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @UUIDString()
  id: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class GetMenuItemsParamsDto {
  @OptionalString()
  search?: string;

  @OptionalString()
  categoryId?: string;

  @Limit()
  limit: number;

  @Skip()
  skip: number;
}

export class MenuItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DeleteMenuItemDto {
  @UUIDString()
  id: string;
}
