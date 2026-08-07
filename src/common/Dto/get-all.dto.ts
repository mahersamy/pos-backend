import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10, default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'sort must be asc or desc' })
  sort?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Search term to filter results', example: 'John' })
  @IsOptional()
  @IsString()
  search?: string;
}
