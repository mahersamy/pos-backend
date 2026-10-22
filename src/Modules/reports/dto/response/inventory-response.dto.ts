import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/Dto/paginated-response.dto';

export class InventorySummaryResponseDto {
  @ApiProperty({ example: 120, description: 'Distinct active SKU/inventory count' })
  totalSkus: number;

  @ApiProperty({ example: 105, description: 'Items with quantity above their reorder threshold' })
  inStockCount: number;

  @ApiProperty({ example: 10, description: 'Active items at or below reorder threshold with quantity > 0' })
  lowStockCount: number;

  @ApiProperty({ example: 5, description: 'Active items with quantity at or below 0 or marked outofstock' })
  outOfStockCount: number;

  @ApiProperty({ example: 45890.5, description: 'Total valuation of current active inventory based on unit retail price' })
  totalStockValue: number;

  @ApiProperty({ example: 'EGP' })
  currency: string;

  @ApiProperty({ example: 'retail_price', description: 'Valuation method used for totalStockValue' })
  valuationMethod: string;
}

export class InventoryLowStockItemDto {
  @ApiProperty({ example: '671f1234567890abcdef1234' })
  inventoryId: string;

  @ApiProperty({ example: 'Coffee Beans' })
  name: string;

  @ApiPropertyOptional({ example: { _id: '671f...', name: 'Beverages' } })
  category?: { _id: string; name: string };

  @ApiProperty({ example: 4 })
  quantity: number;

  @ApiProperty({ example: 10 })
  reorderLevel: number;

  @ApiProperty({ example: 'instock' })
  stock: string;

  @ApiProperty({ example: 85 })
  price: number;
}

export class InventoryLowStockResponseDto extends PaginatedResponseDto<InventoryLowStockItemDto> {
  @ApiProperty({ type: [InventoryLowStockItemDto] })
  items: InventoryLowStockItemDto[];
}

export class InventoryMovementItemDto {
  @ApiProperty({ example: '671f9876543210abcdef4321' })
  _id: string;

  @ApiProperty({ example: '671f1234567890abcdef1234' })
  inventoryId: string;

  @ApiPropertyOptional({ example: 'Coffee Beans' })
  inventoryName?: string;

  @ApiProperty({ example: 'sale' })
  type: string;

  @ApiProperty({ example: -2, description: 'Signed stock quantity delta' })
  quantityDelta: number;

  @ApiProperty({ example: 10 })
  quantityBefore: number;

  @ApiProperty({ example: 8 })
  quantityAfter: number;

  @ApiPropertyOptional({ example: 'order' })
  referenceType?: string;

  @ApiPropertyOptional({ example: '671f0000000000abcdef0000' })
  referenceId?: string;

  @ApiPropertyOptional({ example: '671f1111111111abcdef1111' })
  actorId?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  actorName?: string;

  @ApiPropertyOptional({ example: 'Sale on order #042' })
  reason?: string;

  @ApiProperty({ example: '2026-10-19T10:15:30.000Z' })
  createdAt: Date | string;
}

export class InventoryMovementResponseDto extends PaginatedResponseDto<InventoryMovementItemDto> {
  @ApiProperty({ type: [InventoryMovementItemDto] })
  items: InventoryMovementItemDto[];
}
