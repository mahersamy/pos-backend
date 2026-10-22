import { MAX_PAGE_LIMIT } from '../constants/reports.constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Normalises raw page/limit values into safe pagination parameters.
 */
export function parsePaginationParams(
  page?: number,
  limit?: number,
  maxLimit: number = MAX_PAGE_LIMIT,
): PaginationParams {
  const p = Math.max(1, page || 1);
  const l = Math.max(1, Math.min(maxLimit, limit || 20));
  return { page: p, limit: l, skip: (p - 1) * l };
}

/**
 * Wraps a list of items and a total count into a standard paginated response shape.
 */
export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams,
) {
  const totalPages = Math.ceil(total / params.limit) || 1;
  return {
    items,
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
}
