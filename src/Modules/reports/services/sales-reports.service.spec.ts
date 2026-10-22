import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SalesReportsService } from './sales-reports.service';
import { ReportDateHelper } from '../helpers/report-date.helper';
import { Order } from '../../orders/model/orders.model';
import { OrderStatus, OrderType } from '../../../common';
import { CacheHelperService } from '../../../common/cache/cache.service';
import { TrendGroupBy } from '../enums';

describe('SalesReportsService', () => {
  let service: SalesReportsService;
  let mockOrderModel: any;
  let mockCacheHelper: any;

  beforeEach(async () => {
    mockOrderModel = {
      aggregate: jest.fn(),
    };

    mockCacheHelper = {
      cacheOrSet: jest.fn((_key: string, cb: () => Promise<any>) => cb()),
      safeMetric: jest.fn((cb: () => Promise<any>) => cb()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesReportsService,
        ReportDateHelper,
        {
          provide: CacheHelperService,
          useValue: mockCacheHelper,
        },
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
      ],
    }).compile();

    service = module.get<SalesReportsService>(SalesReportsService);
  });

  describe('getSummary', () => {
    it('should calculate KPI totals accurately when orders exist and use cache', async () => {
      mockOrderModel.aggregate.mockResolvedValueOnce([
        {
          totalOrders: 10,
          completedOrders: 8,
          cancelledOrders: 2,
          grossSales: 2400.5,
        },
      ]);

      const result = await service.getSummary({
        startDate: '2026-10-01',
        endDate: '2026-10-10',
      });

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(mockCacheHelper.cacheOrSet).toHaveBeenCalled();
      expect(result.currency).toBe('EGP');
      expect(result.totalOrders).toBe(10);
      expect(result.completedOrders).toBe(8);
      expect(result.cancelledOrders).toBe(2);
      expect(result.grossSales).toBe(2400.5);
      expect(result.netSales).toBe(2400.5);
      expect(result.averageOrderValue).toBe(300.06); // 2400.5 / 8
      expect(result.startDate).toBe('2026-10-01');
      expect(result.endDate).toBe('2026-10-10');
    });

    it('should return safe zeros when no orders match', async () => {
      mockOrderModel.aggregate.mockResolvedValueOnce([]);

      const result = await service.getSummary({
        startDate: '2026-10-01',
        endDate: '2026-10-05',
      });

      expect(result.totalOrders).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.cancelledOrders).toBe(0);
      expect(result.grossSales).toBe(0);
      expect(result.netSales).toBe(0);
      expect(result.averageOrderValue).toBe(0);
    });
  });

  describe('getTrends', () => {
    it('should return continuous time-series and zero-fill missing days', async () => {
      mockOrderModel.aggregate.mockResolvedValueOnce([
        {
          _id: new Date('2026-10-02T12:00:00.000Z'),
          orderCount: 4,
          sales: 800,
        },
      ]);

      const result = await service.getTrends({
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        groupBy: TrendGroupBy.DAY,
      });

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(result.groupBy).toBe(TrendGroupBy.DAY);
      expect(result.items.length).toBe(3);
      // Day 1 (no sales)
      expect(result.items[0].periodLabel).toBe('2026-10-01');
      expect(result.items[0].orderCount).toBe(0);
      expect(result.items[0].sales).toBe(0);
      // Day 2 (has sales)
      expect(result.items[1].periodLabel).toBe('2026-10-02');
      expect(result.items[1].orderCount).toBe(4);
      expect(result.items[1].sales).toBe(800);
      expect(result.items[1].averageOrderValue).toBe(200);
      // Day 3 (no sales)
      expect(result.items[2].periodLabel).toBe('2026-10-03');
      expect(result.items[2].orderCount).toBe(0);
      expect(result.items[2].sales).toBe(0);
    });
  });

  describe('getByOrderType', () => {
    it('should compute percentages and ticket averages across order types', async () => {
      mockOrderModel.aggregate.mockResolvedValueOnce([
        { _id: OrderType.DINE_IN, orderCount: 10, sales: 3000 },
        { _id: OrderType.DELIVERY, orderCount: 5, sales: 1000 },
      ]);

      const result = await service.getByOrderType({
        startDate: '2026-10-01',
        endDate: '2026-10-10',
      });

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(result.totalSales).toBe(4000);
      expect(result.items.length).toBe(2);

      const dineIn = result.items.find((i) => i.orderType === OrderType.DINE_IN);
      expect(dineIn?.percentageOfSales).toBe(75.0);
      expect(dineIn?.averageOrderValue).toBe(300);

      const delivery = result.items.find((i) => i.orderType === OrderType.DELIVERY);
      expect(delivery?.percentageOfSales).toBe(25.0);
      expect(delivery?.averageOrderValue).toBe(200);
    });
  });
});
