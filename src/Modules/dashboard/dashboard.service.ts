import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../../DB/Repository/order.repository';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { InventoryStock } from '../../common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';




@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  // Cached Helper
  private async cacheOrSet<T>(
    key: string,
    cb: () => Promise<T>,
    ttl = 60000,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);

    if (cached !== undefined) {
      console.log('CACHE HIT:', key);
      return cached;
    }

    console.log('CACHE MISS → FETCHING:', key);

    const freshData = await cb();

    await this.cacheManager.set(
      key,
      freshData,
      ttl,
    );

    return freshData;
  }

  private async safeMetric<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      return await promise;
    } catch {
      return fallback;
    }
  }

  private buildNonCancelledDateMatch(start: Date, end: Date) {
    return {
      createdAt: {
        $gte: start,
        $lte: end,
      },
      status: {
        $ne: 'cancelled',
      },
    };
  }

  // Get Dashboard Metrics
  async getDashboardMetrics() {
    const [
      dailySales,
      monthlyRevenue,
      overview,
      popularDishes,
      lowStockItems,
    ] = await Promise.all([
      this.safeMetric(this.getDailySales(), 0),

      this.safeMetric(
        this.getMonthlyRevenue(),
        0,
      ),

      this.safeMetric(
        this.getOverviewCached(),
        [],
      ),

      this.safeMetric(
        this.getPopularDishesCached(),
        [],
      ),

      this.safeMetric(
        this.getLowStockItemsCached(),
        [],
      ),
    ]);

    return {
      dailySales,
      monthlyRevenue,
      overview,
      popularDishes,
      lowStockItems,
    };
  }

  private async getRevenueBetweenDates(start: Date, end: Date): Promise<number> {
    const result = await this.orderRepo.aggregate([
      {
        $match: this.buildNonCancelledDateMatch(start, end),
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$totalAmount',
          },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private async getDailySales() {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getRevenueBetweenDates(startOfDay, endOfDay);
  }

  private async getMonthlyRevenue() {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return this.getRevenueBetweenDates(startOfMonth, endOfMonth);
  }

  private async getOverview() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const result = await this.orderRepo.aggregate([
      {
        $match: this.buildNonCancelledDateMatch(startOfYear, endOfYear),
      },
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

    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const overview = months.map((month) => ({
      name: month,
      dineInSales: 0,
      totalRevenue: 0,
    }));

    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === 'dine_in') {
        overview[monthIndex].dineInSales += item.total;
      }
      overview[monthIndex].totalRevenue += item.total;
    });

    return overview;
  }

  private async getPopularDishes() {
    const result = await this.orderRepo.aggregate([
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
          from: 'inventories', // Usually pluralized collection name
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

    return result;
  }

  private async getLowStockItems() {
    const result = await this.inventoryRepo.aggregate([
      {
        $match: {
          stock: InventoryStock.INSTOCK,
          quantity: { $lt: 50 },
        },
      },
      {
        $sort: { quantity: 1 },
      },
      {
        $limit: 10,
      },
    ]);
    return result;
  }


  // Cached 
  private async getOverviewCached() {
    return this.cacheOrSet(
      'dashboard:overview',
      () => this.getOverview(),
      1000 * 60,
    );
  }

  private async getPopularDishesCached() {
    return this.cacheOrSet(
      'dashboard:popular-dishes',
      () => this.getPopularDishes(),
      1000 * 60 * 5,
    );
  }

  private async getLowStockItemsCached() {
    return this.cacheOrSet(
      'dashboard:low-stock',
      () => this.getLowStockItems(),
      1000 * 60 * 2,
    );
  }
}
