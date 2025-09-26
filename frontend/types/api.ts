import { ID, ApiResponse, PaginatedResponse, PaginationParams } from "./common";

// HTTP methods
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// API error interface
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string; // For validation errors
  timestamp: string;
}

// API request configuration
export interface ApiRequestConfig<TData = unknown> {
  method: HttpMethod;
  url: string;
  data?: TData;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// API response types
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends ApiResponse<null> {
  success: false;
  data: null;
  error: ApiError;
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Paginated API response
export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication API types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: ID;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// Book API types
export interface BookSearchParams extends PaginationParams {
  query?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface BookSearchResponse {
  books: Array<{
    id: ID;
    title: string;
    author: string;
    isbn?: string;
    cover: string;
    description?: string;
    publishedDate?: string;
    averageRating?: number;
    ratingsCount?: number;
  }>;
  total: number;
}

// Library API types
export interface LibraryBooksParams extends PaginationParams {
  listId?: ID;
  status?: string[];
  genre?: string[];
  search?: string;
}

export interface ReadingListCreateRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

export interface ReadingListUpdateRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  bookIds?: ID[];
}

// Chat API types
export interface SendMessageRequest {
  content: string;
  conversationId?: ID;
  parentMessageId?: ID;
}

export interface SendMessageResponse {
  message: {
    id: ID;
    content: string;
    type: "user" | "ai";
    timestamp: string;
    suggestions?: string[];
    bookRecommendations?: Array<{
      id: ID;
      title: string;
      author: string;
      reason: string;
    }>;
  };
  conversationId: ID;
}

export interface ConversationListParams extends PaginationParams {
  search?: string;
  archived?: boolean;
  pinned?: boolean;
}

// User API types
export interface UserProfileUpdateRequest {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  favoriteGenres?: string[];
}

export interface UserPreferencesUpdateRequest {
  theme?: "light" | "dark" | "auto";
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isProfilePublic?: boolean;
  isLibraryPublic?: boolean;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  type: "avatar" | "book-cover" | "import";
  metadata?: Record<string, string | number | boolean>;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// Batch operation types
export interface BatchOperation<T> {
  operation: "create" | "update" | "delete";
  data: T;
  id?: ID;
}

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
}

export interface BatchResponse<T> {
  results: Array<{
    success: boolean;
    data?: T;
    error?: ApiError;
    operation: BatchOperation<T>;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// WebSocket message types
export interface WebSocketMessage<TPayload = unknown> {
  type: string;
  payload: TPayload;
  timestamp: string;
  id?: string;
}

export interface WebSocketError {
  type: "error";
  payload: {
    code: string;
    message: string;
  };
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
  retryAfter?: number;
}

// Health check types
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: Record<
    string,
    {
      status: "up" | "down";
      responseTime?: number;
      error?: string;
    }
  >;
}
