import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, OrderType } from '../../../../common';
import { ReportDateRangeDto } from './report-date-range.dto';
import { TrendGroupBy } from '../../enums';

export class SalesSummaryQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional({
    enum: OrderType,
    description: 'Filter by order type (dine_in or delivery)',
  })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description:
      'Filter by order status. By default, completed orders are used for revenue totals, and cancelled orders are reported separately.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class SalesTrendsQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional({
    enum: TrendGroupBy,
    default: TrendGroupBy.DAY,
    description: 'Granularity grouping for time-series trend sequence',
  })
  @IsOptional()
  @IsEnum(TrendGroupBy)
  groupBy?: TrendGroupBy = TrendGroupBy.DAY;

  @ApiPropertyOptional({
    enum: OrderType,
    description: 'Filter by order type (dine_in or delivery)',
  })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filter by order status. Default is completed orders.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class SalesByOrderTypeQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filter by order status. Default is completed orders.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
