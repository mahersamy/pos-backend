export const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

export const CACHE_KEYS = {
  DAILY_SALES: 'dashboard:daily-sales',
  MONTHLY_REVENUE: 'dashboard:monthly-revenue',
  OVERVIEW: 'dashboard:overview',
  POPULAR_DISHES: 'dashboard:popular-dishes',
  LOW_STOCK: 'dashboard:low-stock',
} as const;

export const CACHE_TTL = {
  DAILY_SALES: 30_000,        // 30s
  MONTHLY_REVENUE: 60_000,    // 1 min
  OVERVIEW: 60_000,           // 1 min
  POPULAR_DISHES: 5 * 60_000, // 5 min
  LOW_STOCK: 2 * 60_000,      // 2 min
} as const;