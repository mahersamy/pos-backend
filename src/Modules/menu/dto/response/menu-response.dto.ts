import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';

export class MenuResponseDto {
  @ApiProperty({ description: 'Menu ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Menu name', example: 'Main Menu' })
  name: string;

  @ApiPropertyOptional({ description: 'Menu description', example: 'Standard lunch and dinner options' })
  description?: string;

  @ApiProperty({ description: 'Status of the menu', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'User ID of the creator', example: '60d21b4967d0d8992e610c87' })
  createdBy: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedMenuResponseDto extends PaginatedResponseDto<MenuResponseDto> {
  @ApiProperty({ type: [MenuResponseDto], description: 'List of menus' })
  data: MenuResponseDto[];
}
