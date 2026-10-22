/** Default currency code for all monetary report values. */
export const DEFAULT_CURRENCY = 'EGP';

/** Default reorder level when an inventory item has none configured. */
export const DEFAULT_REORDER_LEVEL = 10;

/** Maximum items returned per page in paginated report endpoints. */
export const MAX_PAGE_LIMIT = 100;

/** Redis cache key prefixes for report endpoints. */
export const REPORT_CACHE_KEYS = {
  SALES_SUMMARY: 'reports:sales-summary',
  SALES_TRENDS: 'reports:sales-trends',
  SALES_BY_ORDER_TYPE: 'reports:sales-by-order-type',
  INVENTORY_SUMMARY: 'reports:inventory-summary',
  INVENTORY_LOW_STOCK: 'reports:inventory-low-stock',
  INVENTORY_MOVEMENTS: 'reports:inventory-movements',
} as const;

/** Redis cache TTLs in milliseconds for report endpoints. */
export const REPORT_CACHE_TTL = {
  SALES_SUMMARY: 30_000,            // 30 s
  SALES_TRENDS: 5 * 60_000,         // 5 min
  SALES_BY_ORDER_TYPE: 5 * 60_000,  // 5 min
  INVENTORY_SUMMARY: 2 * 60_000,    // 2 min
  INVENTORY_LOW_STOCK: 2 * 60_000,  // 2 min
  INVENTORY_MOVEMENTS: 60_000,      // 1 min
} as const;

/**
 * Builds a deterministic cache key from a prefix and query parameters.
 * Sorts keys alphabetically and omits undefined/null values for consistency.
 */
export function buildReportCacheKey(
  prefix: string,
  query: Record<string, any>,
): string {
  const parts = Object.keys(query)
    .filter((k) => query[k] !== undefined && query[k] !== null)
    .sort()
    .map((k) => `${k}=${query[k]}`);
  return parts.length > 0 ? `${prefix}:${parts.join(':')}` : prefix;
}
