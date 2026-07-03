import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../DB/Repository/order.repository';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { InventoryStock } from '../../common';
import { DashboardHelpers } from './dashboard.helpers';
import {
  MonthlyOverviewItem,
  PopularDishItem,
  LowStockItem,
} from './dto/dashboard-metrics.dto';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly helpers: DashboardHelpers,
  ) {}

  // ─── Raw Queries ─────────────────────────────────────────────────────────────

  private async getRevenueBetweenDates(start: Date, end: Date): Promise<number> {
    const result = await this.orderRepo.aggregate([
      { $match: this.helpers.buildNonCancelledDateMatch(start, end) },
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
      { $match: this.helpers.buildNonCancelledDateMatch(startOfYear, endOfYear) },
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

  // ─── Cached Public Methods (called by controller endpoints) ─────────────────

  async getDailySalesCached(): Promise<number> {
    return this.helpers.cacheOrSet(
      'dashboard:daily-sales',
      () => this.getDailySales(),
      1000 * 30, // 30s
    );
  }

  async getMonthlyRevenueCached(): Promise<number> {
    return this.helpers.cacheOrSet(
      'dashboard:monthly-revenue',
      () => this.getMonthlyRevenue(),
      1000 * 60, // 1 min
    );
  }

  async getOverviewCached(): Promise<MonthlyOverviewItem[]> {
    return this.helpers.cacheOrSet(
      'dashboard:overview',
      () => this.getOverview(),
      1000 * 60, // 1 min
    );
  }

  async getPopularDishesCached(): Promise<PopularDishItem[]> {
    return this.helpers.cacheOrSet(
      'dashboard:popular-dishes',
      () => this.getPopularDishes(),
      1000 * 60 * 5, // 5 min
    );
  }

  async getLowStockItemsCached(): Promise<LowStockItem[]> {
    return this.helpers.cacheOrSet(
      'dashboard:low-stock',
      () => this.getLowStockItems(),
      1000 * 60 * 2, // 2 min
    );
  }

}
