import { Injectable } from '@nestjs/common';
import { SalesReportsService } from './services/sales-reports.service';
import { InventoryReportsService } from './services/inventory-reports.service';
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

@Injectable()
export class ReportsService {
  constructor(
    private readonly salesReportsService: SalesReportsService,
    private readonly inventoryReportsService: InventoryReportsService,
  ) {}

  // ─── Sales Reports ─────────────────────────────────────────────────────────

  getSalesReport(query: ReportDateDto): Promise<SalesSummaryResponseDto> {
    return this.salesReportsService.getSummary(query);
  }

  getSalesSummary(query: SalesSummaryQueryDto): Promise<SalesSummaryResponseDto> {
    return this.salesReportsService.getSummary(query);
  }

  getSalesTrends(query: SalesTrendsQueryDto): Promise<SalesTrendsResponseDto> {
    return this.salesReportsService.getTrends(query);
  }

  getSalesByOrderType(query: SalesByOrderTypeQueryDto): Promise<SalesByOrderTypeResponseDto> {
    return this.salesReportsService.getByOrderType(query);
  }

  // ─── Inventory Reports ─────────────────────────────────────────────────────

  getInventorySummary(query: InventorySummaryQueryDto): Promise<InventorySummaryResponseDto> {
    return this.inventoryReportsService.getSummary(query);
  }

  getInventoryLowStock(query: InventoryLowStockQueryDto): Promise<InventoryLowStockResponseDto> {
    return this.inventoryReportsService.getLowStock(query);
  }

  getInventoryMovements(query: InventoryMovementQueryDto): Promise<InventoryMovementResponseDto> {
    return this.inventoryReportsService.getMovements(query);
  }
}
