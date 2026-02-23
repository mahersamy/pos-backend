import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum InventoryStock {
  INSTOCK = 'instock',
  OUTOFSTOCK = 'outofstock',
}

export enum InventoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsEnum(InventoryStock)
  @IsOptional()
  stock?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsBoolean()
  @Type(() => Boolean)
  perishable: boolean;

  // Image comes from Cloudinary interceptor, not strictly required in body DTO.
}
