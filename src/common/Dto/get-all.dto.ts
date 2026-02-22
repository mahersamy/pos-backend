import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetAllDto {
 @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['asc', 'desc'],{message:"sort must be asc or desc"})
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;

}