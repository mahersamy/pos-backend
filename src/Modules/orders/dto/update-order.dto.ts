import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsEnum(['in_process', 'completed', 'cancelled', 'ready'], {
    message:
      'Invalid order status must be in_process or completed or cancelled or ready',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
