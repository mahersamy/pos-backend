import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../orders/model/orders.model';
import { OrderStatus } from '../../../common';
import { CacheHelperService } from '../../../common/cache/cache.service';
import { ReportDateHelper } from '../helpers/report-date.helper';
import {
  DEFAULT_CURRENCY,
  REPORT_CACHE_KEYS,
  REPORT_CACHE_TTL,
  buildReportCacheKey,
} from '../constants';
import { TrendGroupBy } from '../enums';
import { IDateRangeResult } from '../interfaces';
import {
  SalesByOrderTypeQueryDto,
  SalesByOrderTypeResponseDto,
  SalesSummaryQueryDto,
  SalesSummaryResponseDto,
  SalesTrendItemDto,
  SalesTrendsQueryDto,
  SalesTrendsResponseDto,
} from '../dto';

@Injectable()
export class SalesReportsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly reportDateHelper: ReportDateHelper,
    private readonly cacheHelperService: CacheHelperService,
  ) {}

  /**
   * Generates sales KPI summary totals for a specified date range.
   * Cached by date range, orderType, and status.
   */
  async getSummary(query: SalesSummaryQueryDto): Promise<SalesSummaryResponseDto> {
    const range = this.reportDateHelper.validateAndParseRange(
      query.startDate,
      query.endDate,
    );

    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.SALES_SUMMARY, {
      ...query,
      startDate: range.startDateStr,
      endDate: range.endDateStr,
    });

    const fallback: SalesSummaryResponseDto = {
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      currency: DEFAULT_CURRENCY,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      grossSales: 0,
      discountTotal: 0,
      refundTotal: 0,
      netSales: 0,
      averageOrderValue: 0,
    };

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeSummary(range, query),
          REPORT_CACHE_TTL.SALES_SUMMARY,
        ),
      fallback,
      cacheKey,
    );
  }

  /**
   * Generates time-series sales trends grouped by day, week, or month with zero-fill gaps.
   * Cached by date range, granularity, orderType, and status.
   */
  async getTrends(query: SalesTrendsQueryDto): Promise<SalesTrendsResponseDto> {
    const groupBy = query.groupBy || TrendGroupBy.DAY;
    const range = this.reportDateHelper.validateAndParseRange(
      query.startDate,
      query.endDate,
    );

    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.SALES_TRENDS, {
      ...query,
      groupBy,
      startDate: range.startDateStr,
      endDate: range.endDateStr,
    });

    const fallback: SalesTrendsResponseDto = {
      groupBy,
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      items: [],
    };

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeTrends(range, groupBy, query),
          REPORT_CACHE_TTL.SALES_TRENDS,
        ),
      fallback,
      cacheKey,
    );
  }

  /**
   * Compares sales performance broken down by order types (dine_in vs delivery).
   * Cached by date range and status.
   */
  async getByOrderType(query: SalesByOrderTypeQueryDto): Promise<SalesByOrderTypeResponseDto> {
    const range = this.reportDateHelper.validateAndParseRange(
      query.startDate,
      query.endDate,
    );

    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.SALES_BY_ORDER_TYPE, {
      ...query,
      startDate: range.startDateStr,
      endDate: range.endDateStr,
    });

    const fallback: SalesByOrderTypeResponseDto = {
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      totalSales: 0,
      items: [],
    };

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeByOrderType(range, query),
          REPORT_CACHE_TTL.SALES_BY_ORDER_TYPE,
        ),
      fallback,
      cacheKey,
    );
  }

  // ─── Private Aggregation Computations ────────────────────────────────────────

  private async computeSummary(
    range: IDateRangeResult,
    query: SalesSummaryQueryDto,
  ): Promise<SalesSummaryResponseDto> {
    const match = this.buildSalesMatch(range, query.orderType, query.status);

    const [stats] = await this.orderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0],
            },
          },
          grossSales: {
            $sum: {
              $cond: [
                query.status ? true : { $eq: ['$status', OrderStatus.COMPLETED] },
                '$totalAmount',
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalOrders = stats?.totalOrders ?? 0;
    const completedOrders =
      stats?.completedOrders ?? (query.status === OrderStatus.COMPLETED ? totalOrders : 0);
    const cancelledOrders =
      stats?.cancelledOrders ?? (query.status === OrderStatus.CANCELLED ? totalOrders : 0);
    const grossSales = stats?.grossSales ? parseFloat(stats.grossSales.toFixed(2)) : 0;

    // In current data model, discounts & refunds are not separately tracked on Order documents
    const discountTotal = 0;
    const refundTotal = 0;
    const netSales = parseFloat((grossSales - discountTotal - refundTotal).toFixed(2));

    const denominator = query.status ? totalOrders : completedOrders;
    const averageOrderValue =
      denominator > 0 ? parseFloat((netSales / denominator).toFixed(2)) : 0;

    return {
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      currency: DEFAULT_CURRENCY,
      totalOrders,
      completedOrders,
      cancelledOrders,
      grossSales,
      discountTotal,
      refundTotal,
      netSales,
      averageOrderValue,
    };
  }

  private async computeTrends(
    range: IDateRangeResult,
    groupBy: TrendGroupBy,
    query: SalesTrendsQueryDto,
  ): Promise<SalesTrendsResponseDto> {
    const match = this.buildSalesMatch(
      range,
      query.orderType,
      query.status ?? OrderStatus.COMPLETED,
    );

    const aggregated = await this.orderModel.aggregate<{
      _id: Date;
      orderCount: number;
      sales: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: groupBy,
              timezone: range.timezone,
            },
          },
          orderCount: { $sum: 1 },
          sales: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map aggregated points by their timezone-aware periodLabel
    const aggMap = new Map<string, { orderCount: number; sales: number }>();
    for (const item of aggregated) {
      if (item._id) {
        const label = this.reportDateHelper.formatPeriodLabel(
          new Date(item._id),
          groupBy,
          range.timezone,
        );
        aggMap.set(label, {
          orderCount: item.orderCount,
          sales: item.sales,
        });
      }
    }

    // Zero-fill missing periods across the entire requested range
    const buckets = this.reportDateHelper.generateBuckets(
      range.start,
      range.endExclusive,
      groupBy,
      range.timezone,
    );

    const items: SalesTrendItemDto[] = buckets.map((bucket) => {
      const data = aggMap.get(bucket.periodLabel) ?? { orderCount: 0, sales: 0 };
      const sales = parseFloat(data.sales.toFixed(2));
      const aov = data.orderCount > 0 ? parseFloat((sales / data.orderCount).toFixed(2)) : 0;

      return {
        periodStart: bucket.periodStart,
        periodLabel: bucket.periodLabel,
        orderCount: data.orderCount,
        sales,
        averageOrderValue: aov,
      };
    });

    return {
      groupBy,
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      items,
    };
  }

  private async computeByOrderType(
    range: IDateRangeResult,
    query: SalesByOrderTypeQueryDto,
  ): Promise<SalesByOrderTypeResponseDto> {
    const match = this.buildSalesMatch(
      range,
      undefined,
      query.status ?? OrderStatus.COMPLETED,
    );

    const aggregated = await this.orderModel.aggregate<{
      _id: string;
      orderCount: number;
      sales: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: '$orderType',
          orderCount: { $sum: 1 },
          sales: { $sum: '$totalAmount' },
        },
      },
      { $sort: { sales: -1 } },
    ]);

    const totalSales = aggregated.reduce((acc, curr) => acc + (curr.sales || 0), 0);

    const items = aggregated.map((item) => {
      const sales = parseFloat(item.sales.toFixed(2));
      const aov = item.orderCount > 0 ? parseFloat((sales / item.orderCount).toFixed(2)) : 0;
      const pct = totalSales > 0 ? parseFloat(((sales / totalSales) * 100).toFixed(1)) : 0;

      return {
        orderType: item._id,
        orderCount: item.orderCount,
        sales,
        averageOrderValue: aov,
        percentageOfSales: pct,
      };
    });

    return {
      startDate: range.startDateStr,
      endDate: range.endDateStr,
      totalSales: parseFloat(totalSales.toFixed(2)),
      items,
    };
  }

  private buildSalesMatch(
    range: IDateRangeResult,
    orderType?: string,
    status?: string,
  ): Record<string, any> {
    const match: Record<string, any> = {
      createdAt: { $gte: range.start, $lt: range.endExclusive },
    };
    if (orderType) {
      match.orderType = orderType;
    }
    if (status) {
      match.status = status;
    }
    return match;
  }
}
