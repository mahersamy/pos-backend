import { IsEnum, IsOptional } from 'class-validator';
import { GetAllDto } from '../../../common/Dto/get-all.dto';

export class GetAllOrderDto extends GetAllDto {
  @IsOptional()
  @IsEnum(['in_process', 'completed', 'cancelled', 'ready'])
  status?: string;

  @IsOptional()
  @IsEnum(['dine_in', 'delivery'])
  orderType?: string;
}
