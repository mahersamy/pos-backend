import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';
import { InventoryStatus, InventoryStock } from '../request/create-inventory.dto';

export class InventoryResponseDto {
  @ApiProperty({ description: 'Inventory Item ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Name of the item', example: 'Coca Cola' })
  name: string;

  @ApiProperty({ description: 'Category ID', example: '60d21b4967d0d8992e610c85' })
  category: string;

  @ApiProperty({ description: 'Quantity in stock', example: 100 })
  quantity: number;

  @ApiProperty({ description: 'Stock status', enum: InventoryStock, example: InventoryStock.INSTOCK })
  stock: string;

  @ApiProperty({ description: 'Item status', enum: InventoryStatus, example: InventoryStatus.ACTIVE })
  status: string;

  @ApiProperty({ description: 'Price per unit', example: 2.5 })
  price: number;

  @ApiProperty({ description: 'Is the item perishable?', example: false })
  perishable: boolean;

  @ApiPropertyOptional({ 
    description: 'Item image details', 
    example: { secure_url: 'https://res.cloudinary.com/.../image.jpg' } 
  })
  image?: {
    secure_url: string;
  };

  @ApiProperty({ description: 'ID of the user who created the item' })
  createdBy: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedInventoryResponseDto extends PaginatedResponseDto<InventoryResponseDto> {
  @ApiProperty({ type: [InventoryResponseDto], description: 'List of inventory items' })
  data: InventoryResponseDto[];
}
