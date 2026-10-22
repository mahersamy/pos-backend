import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from '../../inventory/model/inventory.model';
import {
  InventoryMovement,
  InventoryMovementDocument,
} from '../../inventory/model/inventory-movement.model';
import { InventoryStatus, InventoryStock } from '../../../common';
import { CacheHelperService } from '../../../common/cache/cache.service';
import { ReportDateHelper } from '../helpers/report-date.helper';
import {
  buildPaginatedResponse,
  PaginationParams,
  parsePaginationParams,
} from '../helpers/pagination.helper';
import {
  DEFAULT_CURRENCY,
  DEFAULT_REORDER_LEVEL,
  REPORT_CACHE_KEYS,
  REPORT_CACHE_TTL,
  buildReportCacheKey,
} from '../constants';
import { ValuationMethod } from '../enums';
import { IDateRangeResult } from '../interfaces';
import {
  InventoryLowStockItemDto,
  InventoryLowStockQueryDto,
  InventoryLowStockResponseDto,
  InventoryMovementItemDto,
  InventoryMovementQueryDto,
  InventoryMovementResponseDto,
  InventorySummaryQueryDto,
  InventorySummaryResponseDto,
} from '../dto';

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovementDocument>,
    private readonly reportDateHelper: ReportDateHelper,
    private readonly cacheHelperService: CacheHelperService,
  ) {}

  /**
   * Generates high-level inventory valuation and stock status metrics.
   * Cached by optional categoryId.
   */
  async getSummary(query: InventorySummaryQueryDto): Promise<InventorySummaryResponseDto> {
    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.INVENTORY_SUMMARY, query);

    const fallback: InventorySummaryResponseDto = {
      totalSkus: 0,
      inStockCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalStockValue: 0,
      currency: DEFAULT_CURRENCY,
      valuationMethod: ValuationMethod.RETAIL_PRICE,
    };

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeSummary(query),
          REPORT_CACHE_TTL.INVENTORY_SUMMARY,
        ),
      fallback,
      cacheKey,
    );
  }

  /**
   * Returns a paginated list of items currently at or below their reorder threshold.
   * Cached by page, limit, threshold, and categoryId.
   */
  async getLowStock(query: InventoryLowStockQueryDto): Promise<InventoryLowStockResponseDto> {
    const pagination = parsePaginationParams(query.page, query.limit);
    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.INVENTORY_LOW_STOCK, {
      ...query,
      page: pagination.page,
      limit: pagination.limit,
    });

    const fallback: InventoryLowStockResponseDto = buildPaginatedResponse([], 0, pagination);

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeLowStock(query, pagination),
          REPORT_CACHE_TTL.INVENTORY_LOW_STOCK,
        ),
      fallback,
      cacheKey,
    );
  }

  /**
   * Returns paginated historical stock movement ledger records.
   * Cached by page, limit, date range, inventoryId, type, and referenceId.
   */
  async getMovements(query: InventoryMovementQueryDto): Promise<InventoryMovementResponseDto> {
    let range: IDateRangeResult | undefined;
    if (query.startDate || query.endDate) {
      range = this.reportDateHelper.validateAndParseRange(
        query.startDate,
        query.endDate,
      );
    }

    const pagination = parsePaginationParams(query.page, query.limit);
    const cacheKey = buildReportCacheKey(REPORT_CACHE_KEYS.INVENTORY_MOVEMENTS, {
      ...query,
      page: pagination.page,
      limit: pagination.limit,
      startDate: range?.startDateStr,
      endDate: range?.endDateStr,
    });

    const fallback: InventoryMovementResponseDto = buildPaginatedResponse([], 0, pagination);

    return this.cacheHelperService.safeMetric(
      () =>
        this.cacheHelperService.cacheOrSet(
          cacheKey,
          () => this.computeMovements(query, pagination, range),
          REPORT_CACHE_TTL.INVENTORY_MOVEMENTS,
        ),
      fallback,
      cacheKey,
    );
  }

  // ─── Private Query Computations ──────────────────────────────────────────────

  private async computeSummary(
    query: InventorySummaryQueryDto,
  ): Promise<InventorySummaryResponseDto> {
    const match = this.buildSummaryMatch(query);

    const [stats] = await this.inventoryModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSkus: { $sum: 1 },
          inStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$quantity', { $ifNull: ['$reorderLevel', DEFAULT_REORDER_LEVEL] }] },
                    { $ne: ['$stock', InventoryStock.OUTOFSTOCK] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ['$quantity', { $ifNull: ['$reorderLevel', DEFAULT_REORDER_LEVEL] }] },
                    { $gt: ['$quantity', 0] },
                    { $ne: ['$stock', InventoryStock.OUTOFSTOCK] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStockCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $lte: ['$quantity', 0] },
                    { $eq: ['$stock', InventoryStock.OUTOFSTOCK] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalStockValue: {
            $sum: {
              $multiply: [
                { $max: ['$quantity', 0] },
                { $ifNull: ['$price', 0] },
              ],
            },
          },
        },
      },
    ]);

    return {
      totalSkus: stats?.totalSkus ?? 0,
      inStockCount: stats?.inStockCount ?? 0,
      lowStockCount: stats?.lowStockCount ?? 0,
      outOfStockCount: stats?.outOfStockCount ?? 0,
      totalStockValue: stats?.totalStockValue
        ? parseFloat(stats.totalStockValue.toFixed(2))
        : 0,
      currency: DEFAULT_CURRENCY,
      valuationMethod: ValuationMethod.RETAIL_PRICE,
    };
  }

  private async computeLowStock(
    query: InventoryLowStockQueryDto,
    pagination: PaginationParams,
  ): Promise<InventoryLowStockResponseDto> {
    const filter = this.buildLowStockFilter(query);

    const [docs, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .populate('category', 'name')
        .sort({ quantity: 1, name: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      this.inventoryModel.countDocuments(filter),
    ]);

    const items: InventoryLowStockItemDto[] = docs.map((doc: any) => ({
      inventoryId: doc._id.toString(),
      name: doc.name,
      category: doc.category
        ? {
            _id: doc.category._id?.toString() ?? doc.category.toString(),
            name: doc.category.name ?? '',
          }
        : undefined,
      quantity: doc.quantity,
      reorderLevel: doc.reorderLevel ?? DEFAULT_REORDER_LEVEL,
      stock: doc.stock,
      price: doc.price,
    }));

    return buildPaginatedResponse(items, total, pagination);
  }

  private async computeMovements(
    query: InventoryMovementQueryDto,
    pagination: PaginationParams,
    range?: IDateRangeResult,
  ): Promise<InventoryMovementResponseDto> {
    const filter = this.buildMovementsFilter(query, range);

    const [docs, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .populate('inventory', 'name')
        .populate('actorId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      this.movementModel.countDocuments(filter),
    ]);

    const items: InventoryMovementItemDto[] = docs.map((doc: any) => {
      const actor = doc.actorId;
      const actorName = actor
        ? [actor.firstName, actor.lastName].filter(Boolean).join(' ') || actor.email
        : undefined;

      return {
        _id: doc._id.toString(),
        inventoryId: doc.inventory?._id
          ? doc.inventory._id.toString()
          : (doc.inventory?.toString() ?? ''),
        inventoryName: doc.inventory?.name,
        type: doc.type,
        quantityDelta: doc.quantityDelta,
        quantityBefore: doc.quantityBefore,
        quantityAfter: doc.quantityAfter,
        referenceType: doc.referenceType,
        referenceId: doc.referenceId ? doc.referenceId.toString() : undefined,
        actorId: doc.actorId?._id
          ? doc.actorId._id.toString()
          : (doc.actorId?.toString() ?? undefined),
        actorName,
        reason: doc.reason,
        createdAt: doc.createdAt,
      };
    });

    return buildPaginatedResponse(items, total, pagination);
  }

  // ─── Filter Builders ─────────────────────────────────────────────────────────

  private buildSummaryMatch(query: InventorySummaryQueryDto): Record<string, any> {
    const match: Record<string, any> = {
      status: InventoryStatus.ACTIVE,
    };
    if (query.categoryId) {
      match.category = new Types.ObjectId(query.categoryId);
    }
    return match;
  }

  private buildLowStockFilter(query: InventoryLowStockQueryDto): Record<string, any> {
    const filter: Record<string, any> = {
      status: InventoryStatus.ACTIVE,
    };

    if (query.categoryId) {
      filter.category = new Types.ObjectId(query.categoryId);
    }

    if (query.threshold !== undefined) {
      filter.quantity = { $lte: query.threshold };
    } else {
      filter.$expr = {
        $lte: ['$quantity', { $ifNull: ['$reorderLevel', DEFAULT_REORDER_LEVEL] }],
      };
    }

    return filter;
  }

  private buildMovementsFilter(
    query: InventoryMovementQueryDto,
    range?: IDateRangeResult,
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (range) {
      filter.createdAt = { $gte: range.start, $lt: range.endExclusive };
    }

    if (query.inventoryId) {
      filter.inventory = new Types.ObjectId(query.inventoryId);
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.referenceId) {
      filter.referenceId = query.referenceId;
    }

    return filter;
  }
}
