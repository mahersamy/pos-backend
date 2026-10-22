export interface IInventorySummaryMetrics {
  totalSkus: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  currency: string;
  valuationMethod: string;
}

export interface IInventoryLowStockRow {
  inventoryId: string;
  name: string;
  category?: {
    _id: string;
    name: string;
  };
  quantity: number;
  reorderLevel: number;
  stock: string;
  price: number;
}

export interface IInventoryMovementRow {
  _id: string;
  inventoryId: string;
  inventoryName?: string;
  type: string;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: string;
  referenceId?: string;
  actorId?: string;
  actorName?: string;
  reason?: string;
  createdAt: Date | string;
}
