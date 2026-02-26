import {
  IsArray,
  IsMongoId,
  IsNumber,
  ValidateNested,
  IsString,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class InventoryItemDto {
  @IsMongoId()
  inventoryId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];

  @IsString()
  @IsEnum(['dine_in', 'delivery'], {
    message: 'Invalid order type dine_in or delivery',
  })
  orderType: string;

  @IsString()
  @IsOptional()
  table?: string;

  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  deliveryInfo?: string;

  @IsString()
  @IsOptional()
  @Matches(/^01[0125][0-9]{8}$/, { message: 'Invalid Egyptian phone number' })
  phoneNumber?: string;
}
