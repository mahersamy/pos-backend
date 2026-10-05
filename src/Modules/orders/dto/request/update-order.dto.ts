import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/common';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
