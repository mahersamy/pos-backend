export interface ISalesSummaryMetrics {
  startDate: string;
  endDate: string;
  currency: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  grossSales: number;
  discountTotal: number;
  refundTotal: number;
  netSales: number;
  averageOrderValue: number;
}

export interface ISalesTrendPoint {
  periodStart: string;
  periodLabel: string;
  orderCount: number;
  sales: number;
  averageOrderValue: number;
}

export interface ISalesByOrderTypeMetric {
  orderType: string;
  orderCount: number;
  sales: number;
  averageOrderValue: number;
  percentageOfSales: number;
}
