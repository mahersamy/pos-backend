import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Appetizers' })
  name: string;

  @ApiPropertyOptional({ description: 'Category description', example: 'Starters and small plates' })
  description?: string;

  @ApiProperty({ description: 'Associated Menu ID', example: '60d21b4967d0d8992e610c86' })
  menu: string;

  @ApiPropertyOptional({ 
    description: 'Category image details', 
    example: { secure_url: 'https://res.cloudinary.com/.../image.jpg' } 
  })
  image?: {
    secure_url: string;
  };

  @ApiProperty({ description: 'Status of the category', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'User ID of the creator', example: '60d21b4967d0d8992e610c87' })
  createdBy: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedCategoryResponseDto extends PaginatedResponseDto<CategoryResponseDto> {
  @ApiProperty({ type: [CategoryResponseDto], description: 'List of categories' })
  data: CategoryResponseDto[];
}
