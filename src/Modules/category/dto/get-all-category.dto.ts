import { IsMongoId, IsOptional } from 'class-validator';
import { GetAllDto } from 'src/common/Dto/get-all.dto';

export class GetAllCategoryDto extends GetAllDto {
  @IsOptional()
  @IsMongoId()
  menuId?: string; // filter categories by menu
}
