import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  menu: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
