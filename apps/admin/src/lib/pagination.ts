/**
 * Pagination Utilities
 * Helper functions for handling paginated API responses
 */

import type { PaginationParams, PaginationMeta } from "./api-types";

/**
 * Build pagination query params
 */
export function buildPaginationParams(params: PaginationParams): Record<string, string> {
  const queryParams: Record<string, string> = {};

  if (params.page !== undefined) {
    queryParams.page = String(params.page);
  }

  if (params.limit !== undefined) {
    queryParams.limit = String(params.limit);
  }

  if (params.cursor) {
    queryParams.cursor = params.cursor;
  }

  return queryParams;
}

/**
 * Calculate total pages from pagination meta
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Check if there is a next page
 */
export function hasNextPage(pagination: PaginationMeta): boolean {
  if (pagination.nextCursor) {
    return true;
  }
  return pagination.page < pagination.totalPages;
}

/**
 * Check if there is a previous page
 */
export function hasPrevPage(pagination: PaginationMeta): boolean {
  if (pagination.prevCursor) {
    return true;
  }
  return pagination.page > 1;
}

/**
 * Get current page range
 */
export function getCurrentRange(pagination: PaginationMeta): { start: number; end: number } {
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  return { start, end };
}

/**
 * Format pagination info for display
 */
export function formatPaginationInfo(pagination: PaginationMeta): string {
  const { start, end } = getCurrentRange(pagination);
  return `Showing ${start}-${end} of ${pagination.total}`;
}

/**
 * Default pagination params
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGINATION_PARAMS: PaginationParams = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_PAGE_SIZE,
};
