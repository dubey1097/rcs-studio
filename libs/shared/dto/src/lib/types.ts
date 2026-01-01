/**
 * Common type definitions used across the application
 */

export type ApiResponse<T = unknown> = {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SortOrder = 'asc' | 'desc';

export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

