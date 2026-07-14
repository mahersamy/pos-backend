import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../orders/repository/order.repository';
import { InventoryRepository } from '../inventory/repository/inventory.repository';
import { InventoryStock } from '../../common';
import { DashboardHelpers } from './dashboard.helpers';
import {
  MonthlyOverviewItem,
  PopularDishItem,
  LowStockItem,
} from './dto/dashboard-metrics.dto';
import { CacheHelperService } from 'src/common/cache/cache.service';
import { CACHE_KEYS, CACHE_TTL, MONTHS } from './dashboard.constants';



@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly cacheHelperService: CacheHelperService,
    private readonly dashHelpers: DashboardHelpers,
  ) {}

  // ─── Raw Queries ─────────────────────────────────────────────────────────────

  private async getRevenueBetweenDates(start: Date, end: Date): Promise<number> {
    const result = await this.orderRepo.aggregate([
      { $match: this.dashHelpers.buildNonCancelledDateMatch(start, end) },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private async getDailySales(): Promise<number> {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getRevenueBetweenDates(startOfDay, endOfDay);
  }

  private async getMonthlyRevenue(): Promise<number> {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999,
    );

    return this.getRevenueBetweenDates(startOfMonth, endOfMonth);
  }

  private async getOverview(): Promise<MonthlyOverviewItem[]> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const result = await this.orderRepo.aggregate([
      { $match: this.dashHelpers.buildNonCancelledDateMatch(startOfYear, endOfYear) },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            type: '$orderType',
          },
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const overview: MonthlyOverviewItem[] = MONTHS.map((month) => ({
      name: month,
      dineInSales: 0,
      totalRevenue: 0,
    }));

    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      // Only dine_in is broken out separately per product requirement.
      // All order types contribute to totalRevenue.
      if (item._id.type === 'dine_in') {
        overview[monthIndex].dineInSales += item.total;
      }
      overview[monthIndex].totalRevenue += item.total;
    });

    return overview;
  }

  private async getPopularDishes(): Promise<PopularDishItem[]> {
    return this.orderRepo.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.inventory',
          totalOrdered: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: '_id',
          as: 'inventoryDetails',
        },
      },
      { $unwind: '$inventoryDetails' },
      {
        $project: {
          _id: '$inventoryDetails._id',
          name: '$inventoryDetails.name',
          price: '$inventoryDetails.price',
          stock: '$inventoryDetails.stock',
          image: '$inventoryDetails.image',
          totalOrdered: 1,
        },
      },
    ]);
  }

  private async getLowStockItems(): Promise<LowStockItem[]> {
    return this.inventoryRepo.aggregate([
      {
        $match: {
          $or: [
            { stock: InventoryStock.INSTOCK, quantity: { $lt: 50 } },
            { stock: InventoryStock.OUTOFSTOCK },
          ],
        },
      },
      { $sort: { quantity: 1 } },
      { $limit: 10 },
    ]);
  }

  // ─── Cached + Safe Public Methods (called directly by controller) ─────────

  async getDailySalesCached(): Promise<number> {
    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          CACHE_KEYS.DAILY_SALES,
          () => this.getDailySales(),
          CACHE_TTL.DAILY_SALES,
        ),
      0,
      CACHE_KEYS.DAILY_SALES,
    );
  }

  async getMonthlyRevenueCached(): Promise<number> {
    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          CACHE_KEYS.MONTHLY_REVENUE,
          () => this.getMonthlyRevenue(),
          CACHE_TTL.MONTHLY_REVENUE,
        ),
      0,
      CACHE_KEYS.MONTHLY_REVENUE,
    );
  }

  async getOverviewCached(): Promise<MonthlyOverviewItem[]> {
    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          CACHE_KEYS.OVERVIEW,
          () => this.getOverview(),
          CACHE_TTL.OVERVIEW,
        ),
      [],
      CACHE_KEYS.OVERVIEW,
    );
  }

  async getPopularDishesCached(): Promise<PopularDishItem[]> {
    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          CACHE_KEYS.POPULAR_DISHES,
          () => this.getPopularDishes(),
          CACHE_TTL.POPULAR_DISHES,
        ),
      [],
      CACHE_KEYS.POPULAR_DISHES,
    );
  }

  async getLowStockItemsCached(): Promise<LowStockItem[]> {
    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          CACHE_KEYS.LOW_STOCK,
          () => this.getLowStockItems(),
          CACHE_TTL.LOW_STOCK,
        ),
      [],
      CACHE_KEYS.LOW_STOCK,
    );
  }

}
