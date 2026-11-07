import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../../../common';

export class InventoryItemDto {
  @IsMongoId()
  inventoryId: string;

  @IsInt({ message: 'quantity must be a whole number' })
  @Min(1)
  @Max(1000)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'order must contain at least one item' })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];

  @IsEnum(OrderType, { message: 'orderType must be a valid enum value' })
  orderType: OrderType;

  // Required for dine-in, validated if present otherwise
  @ValidateIf((o) => o.orderType === OrderType.DINE_IN || o.table !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  table?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  guestName?: string;

  // Required for delivery, validated if present otherwise
  @ValidateIf(
    (o) => o.orderType === OrderType.DELIVERY || o.deliveryInfo !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  deliveryInfo?: string;

  @ValidateIf(
    (o) => o.orderType === OrderType.DELIVERY || o.phoneNumber !== undefined,
  )
  @Matches(/^01[0125][0-9]{8}$/, { message: 'Invalid Egyptian phone number' })
  phoneNumber?: string;
}
