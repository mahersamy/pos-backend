import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../../../../common/Enums/order-status';

/**
 * Only descriptive fields + status can change after creation.
 * Items / orderType / totals are immutable: changing them would desync stock.
 */
export class UpdateOrderDto extends PartialType(
  PickType(CreateOrderDto, ['table', 'guestName', 'deliveryInfo', 'phoneNumber'] as const),
) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;
}
