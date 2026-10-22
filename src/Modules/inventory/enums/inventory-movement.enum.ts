export enum InventoryMovementType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  SALE = 'sale',
  SALE_REVERSAL = 'sale_reversal',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

export enum InventoryMovementReferenceType {
  ORDER = 'order',
  PURCHASE = 'purchase',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  RETURN = 'return',
}
