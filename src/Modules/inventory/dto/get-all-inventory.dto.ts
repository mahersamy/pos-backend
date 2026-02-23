import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { GetAllDto } from '../../../common/Dto/get-all.dto';
import { InventoryStatus, InventoryStock } from './create-inventory.dto';

export class GetAllInventoryDto extends GetAllDto {
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsEnum(InventoryStock)
  stock?: string;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  perishable?: boolean;
}
