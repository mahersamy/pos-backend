import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';
import { OrderStatus, OrderType } from '../../../../common';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Inventory Item ID', example: '60d21b4967d0d8992e610c85' })
  inventory: string;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  quantity: number;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Order Number', example: '#001' })
  orderNumber: string;

  @ApiProperty({ description: 'Order Status', enum: OrderStatus, example: OrderStatus.IN_PROCESS })
  status: string;

  @ApiProperty({ description: 'Order Type', enum: OrderType, example: OrderType.DINE_IN })
  orderType: string;

  @ApiProperty({ type: [OrderItemResponseDto], description: 'List of ordered items' })
  orderItems: OrderItemResponseDto[];

  @ApiProperty({ description: 'Total Amount', example: 15.5 })
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Table number if dine-in', example: 'T-12' })
  table?: string;

  @ApiPropertyOptional({ description: 'Guest name', example: 'John' })
  guestName?: string;

  @ApiPropertyOptional({ description: 'Delivery information if delivery', example: '123 Main St' })
  deliveryInfo?: string;

  @ApiPropertyOptional({ description: 'Guest phone number', example: '+123456789' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation if cancelled' })
  cancellationReason?: string;

  @ApiProperty({ description: 'ID of the user who created the order' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'ID of the user who last updated the order' })
  updatedBy?: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedOrderResponseDto extends PaginatedResponseDto<OrderResponseDto> {
  @ApiProperty({ type: [OrderResponseDto], description: 'List of orders' })
  data: OrderResponseDto[];
}
