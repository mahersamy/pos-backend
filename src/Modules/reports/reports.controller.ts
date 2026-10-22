import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Action,
  AuthApply,
  CheckPermissions,
  Resource,
} from '../../common';
import { ReportsService } from './reports.service';
import {
  InventoryLowStockQueryDto,
  InventoryLowStockResponseDto,
  InventoryMovementQueryDto,
  InventoryMovementResponseDto,
  InventorySummaryQueryDto,
  InventorySummaryResponseDto,
  ReportDateDto,
  SalesByOrderTypeQueryDto,
  SalesByOrderTypeResponseDto,
  SalesSummaryQueryDto,
  SalesSummaryResponseDto,
  SalesTrendsQueryDto,
  SalesTrendsResponseDto,
} from './dto';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@CheckPermissions({ resource: Resource.REPORTS, actions: [Action.READ] })
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ─── Sales Reports ─────────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Get sales report (summary)',
    description:
      'Returns aggregate gross sales, net sales, total/completed/cancelled order counts, and average order value for a date range in the Africa/Cairo timezone.',
  })
  @ApiOkResponse({
    description: 'Sales report retrieved successfully',
    type: SalesSummaryResponseDto,
  })
  @Get('sales')
  getSalesReport(@Query() query: ReportDateDto) {
    return this.reportsService.getSalesReport(query);
  }

  @ApiOperation({
    summary: 'Get sales summary metrics (KPIs)',
    description:
      'Returns aggregate gross sales, net sales, total/completed/cancelled order counts, and average order value for a date range in the Africa/Cairo timezone.',
  })
  @ApiOkResponse({
    description: 'Sales summary retrieved successfully',
    type: SalesSummaryResponseDto,
  })
  @Get('sales/summary')
  getSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.reportsService.getSalesSummary(query);
  }

  @ApiOperation({
    summary: 'Get sales trends (time-series)',
    description:
      'Returns time-series revenue and order volume grouped by day, week, or month with zero-filled gaps for continuous charts.',
  })
  @ApiOkResponse({
    description: 'Sales trends retrieved successfully',
    type: SalesTrendsResponseDto,
  })
  @Get('sales/trends')
  getSalesTrends(@Query() query: SalesTrendsQueryDto) {
    return this.reportsService.getSalesTrends(query);
  }

  @ApiOperation({
    summary: 'Get sales breakdown by order type',
    description:
      'Compares performance, order volume, average ticket size, and sales share across dine-in and delivery orders.',
  })
  @ApiOkResponse({
    description: 'Sales by order type retrieved successfully',
    type: SalesByOrderTypeResponseDto,
  })
  @Get('sales/by-order-type')
  getSalesByOrderType(@Query() query: SalesByOrderTypeQueryDto) {
    return this.reportsService.getSalesByOrderType(query);
  }

  // ─── Inventory Reports ─────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Get inventory stock status and valuation summary',
    description:
      'Returns total distinct SKUs, in-stock count, low-stock count, out-of-stock count, and total retail valuation for active inventory.',
  })
  @ApiOkResponse({
    description: 'Inventory summary retrieved successfully',
    type: InventorySummaryResponseDto,
  })
  @Get('inventory/summary')
  getInventorySummary(@Query() query: InventorySummaryQueryDto) {
    return this.reportsService.getInventorySummary(query);
  }

  @ApiOperation({
    summary: 'Get low-stock inventory report',
    description:
      'Returns a paginated list of active inventory items whose current quantity is at or below their reorder threshold.',
  })
  @ApiOkResponse({
    description: 'Low-stock inventory items retrieved successfully',
    type: InventoryLowStockResponseDto,
  })
  @Get('inventory/low-stock')
  getInventoryLowStock(@Query() query: InventoryLowStockQueryDto) {
    return this.reportsService.getInventoryLowStock(query);
  }

  @ApiOperation({
    summary: 'Get inventory stock movement history',
    description:
      'Returns paginated audit records for stock deductions (sales), restocks (reversals), and adjustments.',
  })
  @ApiOkResponse({
    description: 'Inventory movements retrieved successfully',
    type: InventoryMovementResponseDto,
  })
  @Get('inventory/movements')
  getInventoryMovements(@Query() query: InventoryMovementQueryDto) {
    return this.reportsService.getInventoryMovements(query);
  }
}
