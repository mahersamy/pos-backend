import { IsEnum, IsOptional } from 'class-validator';
import { GetAllDto } from '../../../common/Dto/get-all.dto';
import { OrderStatus, OrderType } from '../../../common';

export class GetAllOrderDto extends GetAllDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'please choose a valid status' })
  status?: string;

  @IsOptional()
  @IsEnum(OrderType, { message: 'please choose a valid order type' })
  orderType?: string;
}
