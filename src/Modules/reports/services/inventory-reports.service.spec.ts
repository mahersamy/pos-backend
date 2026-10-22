import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InventoryReportsService } from './inventory-reports.service';
import { ReportDateHelper } from '../helpers/report-date.helper';
import { Inventory } from '../../inventory/model/inventory.model';
import { InventoryMovement } from '../../inventory/model/inventory-movement.model';
import { CacheHelperService } from '../../../common/cache/cache.service';
import { ValuationMethod } from '../enums';

describe('InventoryReportsService', () => {
  let service: InventoryReportsService;
  let mockInventoryModel: any;
  let mockMovementModel: any;
  let mockCacheHelper: any;

  beforeEach(async () => {
    mockInventoryModel = {
      aggregate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockMovementModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockCacheHelper = {
      cacheOrSet: jest.fn((_key: string, cb: () => Promise<any>) => cb()),
      safeMetric: jest.fn((cb: () => Promise<any>) => cb()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryReportsService,
        ReportDateHelper,
        {
          provide: CacheHelperService,
          useValue: mockCacheHelper,
        },
        {
          provide: getModelToken(Inventory.name),
          useValue: mockInventoryModel,
        },
        {
          provide: getModelToken(InventoryMovement.name),
          useValue: mockMovementModel,
        },
      ],
    }).compile();

    service = module.get<InventoryReportsService>(InventoryReportsService);
  });

  describe('getSummary', () => {
    it('should aggregate stock buckets and total retail inventory value with cache', async () => {
      mockInventoryModel.aggregate.mockResolvedValueOnce([
        {
          totalSkus: 50,
          inStockCount: 42,
          lowStockCount: 5,
          outOfStockCount: 3,
          totalStockValue: 12500.75,
        },
      ]);

      const result = await service.getSummary({});

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(mockCacheHelper.cacheOrSet).toHaveBeenCalled();
      expect(result.totalSkus).toBe(50);
      expect(result.inStockCount).toBe(42);
      expect(result.lowStockCount).toBe(5);
      expect(result.outOfStockCount).toBe(3);
      expect(result.totalStockValue).toBe(12500.75);
      expect(result.currency).toBe('EGP');
      expect(result.valuationMethod).toBe(ValuationMethod.RETAIL_PRICE);
    });

    it('should return safe zero counts when inventory is empty', async () => {
      mockInventoryModel.aggregate.mockResolvedValueOnce([]);

      const result = await service.getSummary({});

      expect(result.totalSkus).toBe(0);
      expect(result.inStockCount).toBe(0);
      expect(result.lowStockCount).toBe(0);
      expect(result.outOfStockCount).toBe(0);
      expect(result.totalStockValue).toBe(0);
    });
  });

  describe('getLowStock', () => {
    it('should return paginated items matching threshold with cache', async () => {
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: '671f11111111111111111111',
            name: 'Milk 1L',
            category: { _id: 'cat1', name: 'Dairy' },
            quantity: 3,
            reorderLevel: 10,
            stock: 'instock',
            price: 45,
          },
        ]),
      };

      mockInventoryModel.find.mockReturnValue(mockChain);
      mockInventoryModel.countDocuments.mockResolvedValue(1);

      const result = await service.getLowStock({ page: 1, limit: 10 });

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe('Milk 1L');
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('getMovements', () => {
    it('should query persisted movement ledger with pagination and cache', async () => {
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'mov1',
            inventory: { _id: 'inv1', name: 'Coffee Beans' },
            type: 'sale',
            quantityDelta: -2,
            quantityBefore: 10,
            quantityAfter: 8,
            referenceType: 'order',
            referenceId: 'ord123',
            actorId: { firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@pos.com' },
            reason: 'Sale on order #001',
            createdAt: new Date('2026-10-19T10:00:00Z'),
          },
        ]),
      };

      mockMovementModel.find.mockReturnValue(mockChain);
      mockMovementModel.countDocuments.mockResolvedValue(1);

      const result = await service.getMovements({ page: 1, limit: 20 });

      expect(mockCacheHelper.safeMetric).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].type).toBe('sale');
      expect(result.items[0].quantityDelta).toBe(-2);
      expect(result.items[0].inventoryName).toBe('Coffee Beans');
      expect(result.items[0].actorName).toBe('Ahmed Ali');
    });
  });
});
