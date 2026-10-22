import { ApiProperty } from '@nestjs/swagger';

export class SalesSummaryResponseDto {
  @ApiProperty({ example: '2026-10-01' })
  startDate: string;

  @ApiProperty({ example: '2026-10-19' })
  endDate: string;

  @ApiProperty({ example: 'EGP' })
  currency: string;

  @ApiProperty({ example: 245, description: 'Total orders placed in this period' })
  totalOrders: number;

  @ApiProperty({ example: 230, description: 'Total completed/paid orders' })
  completedOrders: number;

  @ApiProperty({ example: 15, description: 'Total cancelled orders' })
  cancelledOrders: number;

  @ApiProperty({ example: 52000, description: 'Gross sales of completed orders before discounts/refunds' })
  grossSales: number;

  @ApiProperty({ example: 0, description: 'Total discounts applied (0 if not modeled in schema)' })
  discountTotal: number;

  @ApiProperty({ example: 0, description: 'Total refunds issued (0 if not modeled in schema)' })
  refundTotal: number;

  @ApiProperty({ example: 52000, description: 'Net sales (grossSales - discountTotal - refundTotal)' })
  netSales: number;

  @ApiProperty({ example: 226.09, description: 'Average order value (netSales / completedOrders)' })
  averageOrderValue: number;
}

export class SalesTrendItemDto {
  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  periodStart: string;

  @ApiProperty({ example: '2026-10-01' })
  periodLabel: string;

  @ApiProperty({ example: 18 })
  orderCount: number;

  @ApiProperty({ example: 3600 })
  sales: number;

  @ApiProperty({ example: 200 })
  averageOrderValue: number;
}

export class SalesTrendsResponseDto {
  @ApiProperty({ example: 'day', enum: ['day', 'week', 'month'] })
  groupBy: string;

  @ApiProperty({ example: '2026-10-01' })
  startDate: string;

  @ApiProperty({ example: '2026-10-19' })
  endDate: string;

  @ApiProperty({ type: [SalesTrendItemDto] })
  items: SalesTrendItemDto[];
}

export class SalesByOrderTypeItemDto {
  @ApiProperty({ example: 'dine_in' })
  orderType: string;

  @ApiProperty({ example: 120 })
  orderCount: number;

  @ApiProperty({ example: 26000 })
  sales: number;

  @ApiProperty({ example: 216.67 })
  averageOrderValue: number;

  @ApiProperty({ example: 65.5, description: 'Percentage of total sales during this period' })
  percentageOfSales: number;
}

export class SalesByOrderTypeResponseDto {
  @ApiProperty({ example: '2026-10-01' })
  startDate: string;

  @ApiProperty({ example: '2026-10-19' })
  endDate: string;

  @ApiProperty({ example: 39700 })
  totalSales: number;

  @ApiProperty({ type: [SalesByOrderTypeItemDto] })
  items: SalesByOrderTypeItemDto[];
}
