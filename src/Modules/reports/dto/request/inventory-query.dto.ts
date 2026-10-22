import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { InventoryMovementType } from '../../../inventory/enums/inventory-movement.enum';
import { ReportDateRangeDto } from './report-date-range.dto';
import { ReportPaginationDto } from './report-pagination.dto';

export class InventorySummaryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter inventory summary by specific category ObjectId',
    example: '671234567890abcdef123456',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}

export class InventoryLowStockQueryDto extends ReportPaginationDto {
  @ApiPropertyOptional({
    description:
      'Custom low-stock quantity threshold. If omitted, uses each item reorderLevel (defaults to 10).',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  threshold?: number;

  @ApiPropertyOptional({
    description: 'Filter low-stock items by specific category ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}

export class InventoryMovementQueryDto extends IntersectionType(
  ReportPaginationDto,
  ReportDateRangeDto,
) {
  @ApiPropertyOptional({
    description: 'Filter movements by specific inventory item ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  inventoryId?: string;

  @ApiPropertyOptional({
    enum: InventoryMovementType,
    description: 'Filter by movement type (stock_in, stock_out, sale, sale_reversal, adjustment, return)',
  })
  @IsOptional()
  @IsEnum(InventoryMovementType)
  type?: InventoryMovementType;

  @ApiPropertyOptional({
    description: 'Filter by reference entity identifier (such as an order ObjectId)',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
