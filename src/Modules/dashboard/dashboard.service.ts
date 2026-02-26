import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../DB/Repository/order.repository';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { InventoryStock } from '../../common';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  async getDashboardMetrics() {
    const [dailySales, monthlyRevenue, overview, popularDishes, lowStockItems] =
      await Promise.all([
        this.getDailySales(),
        this.getMonthlyRevenue(),
        this.getOverview(),
        this.getPopularDishes(),
        this.getLowStockItems(),
      ]);

    return {
      dailySales,
      monthlyRevenue,
      overview,
      popularDishes,
      lowStockItems,
    };
  }

  private async getDailySales(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.orderRepo.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private async getMonthlyRevenue(): Promise<number> {
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

    const result = await this.orderRepo.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private async getOverview(): Promise<any[]> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const result = await this.orderRepo.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          status: { $ne: 'cancelled' },
        },
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
      sales: 0,
      revenue: 0,
    }));

    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === 'dine_in') {
        overview[monthIndex].sales += item.total;
      }
      // Usually "Revenue" is everything, and "Sales" is specifically dine_in? Or maybe just keep tracking them independently. Let's make revenue the total and sales Dine-In, or something similar
      overview[monthIndex].revenue += item.total;
    });

    return overview;
  }

  private async getPopularDishes(): Promise<any[]> {
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

  private async getLowStockItems(): Promise<any[]> {
    const result = await this.inventoryRepo.aggregate([
      {
        $match: {
          stock: InventoryStock.INSTOCK,
        },
      },
      {
        $sort: { quantity: 1 },
      },
      {
        $match: {
          quantity: { $lt: 50 },
        },
      },
      {
        $limit: 10,
      },
    ]);
    return result;
  }

  
}
