// Common utility types and enums

export type ID = string;

export type Timestamp = string; // ISO 8601 string

export type Status = "idle" | "loading" | "success" | "error";

export type SortOrder = "asc" | "desc";

export type ViewMode = "grid" | "list" | "compact";

export type Theme = "light" | "dark" | "auto";

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Timestamp;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter base interface
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Generic state interface for async operations
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Timestamp;
}

// Color variants for UI components
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

// Size variants for UI components
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl";

// Generic action interface
export interface Action<T = any> {
  type: string;
  payload?: T;
}

// Generic entity with common fields
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
