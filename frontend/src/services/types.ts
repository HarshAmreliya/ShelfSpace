// Service layer types and interfaces

import { BookInput } from "@/types/book";
import { ReadingListInput, LibraryFilter } from "../../types/library";
import { ID } from "@/types/common";

// Base service response interface
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Paginated response interface
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
  success: boolean;
  error?: string;
  timestamp: string;
}

// Service method options
export interface ServiceOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTimeout?: number;
}

// Library service method parameters
export interface GetBooksParams {
  listId?: ID;
  filter?: LibraryFilter;
  page?: number;
  limit?: number;
  options?: ServiceOptions;
}

export interface GetReadingListsParams {
  includeBooks?: boolean;
  options?: ServiceOptions;
}

export interface UpdateBookParams {
  id: ID;
  updates: Partial<BookInput>;
  options?: ServiceOptions;
}

export interface CreateReadingListParams {
  list: ReadingListInput;
  options?: ServiceOptions;
}

export interface UpdateReadingListParams {
  id: ID;
  updates: Partial<ReadingListInput>;
  options?: ServiceOptions;
}

export interface DeleteReadingListParams {
  id: ID;
  options?: ServiceOptions;
}

export interface MoveBooksParams {
  bookIds: ID[];
  targetListId: ID;
  sourceListId?: ID;
  options?: ServiceOptions;
}

// Service error types
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id: ID) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFLICT", 409, details);
    this.name = "ConflictError";
  }
}
