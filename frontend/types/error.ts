import { ReactNode } from "react";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error categories
export type ErrorCategory =
  | "network"
  | "validation"
  | "authentication"
  | "authorization"
  | "not-found"
  | "server"
  | "client"
  | "unknown";

// Base error interface
export interface BaseError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  details?: Record<string, unknown> | undefined;
  stack?: string | undefined;
}

// Application error class
export class AppError extends Error implements BaseError {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  details?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    category: ErrorCategory = "unknown",
    severity: ErrorSeverity = "medium",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    if (details) {
      this.details = details;
    }
  }
}

// Validation error interface
export interface ValidationError extends BaseError {
  category: "validation";
  field: string;
  value?: unknown;
  constraint: string;
}

// Network error interface
export interface NetworkError extends BaseError {
  category: "network";
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

// Error fallback component props
export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  retry: () => void;
  errorId?: string;
}

// Error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate errors to this boundary
  level?: "page" | "feature" | "component";
}

// Error context value
export interface ErrorContextValue {
  reportError: (error: Error, context?: Record<string, unknown>) => void;
  clearError: (errorId: string) => void;
  errors: BaseError[];
}

// Error reporting interface
export interface ErrorReport {
  error: BaseError;
  context: {
    userId?: string;
    sessionId: string;
    userAgent: string;
    url: string;
    timestamp: string;
    buildVersion?: string;
    environment: string;
  };
  breadcrumbs: ErrorBreadcrumb[];
}

// Error breadcrumb for debugging
export interface ErrorBreadcrumb {
  timestamp: string;
  category: "navigation" | "user-action" | "api-call" | "state-change";
  message: string;
  data?: Record<string, unknown>;
  level: "info" | "warning" | "error";
}

// Predefined error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",

  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // Server errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Client errors
  INVALID_REQUEST: "INVALID_REQUEST",
  UNSUPPORTED_OPERATION: "UNSUPPORTED_OPERATION",

  // Feature-specific errors
  BOOK_NOT_FOUND: "BOOK_NOT_FOUND",
  LIST_NOT_FOUND: "LIST_NOT_FOUND",
  CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND",
  IMPORT_FAILED: "IMPORT_FAILED",
  EXPORT_FAILED: "EXPORT_FAILED",
} as const;

// Error message templates
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]:
    "Unable to connect to the server. Please check your internet connection.",
  [ERROR_CODES.TIMEOUT_ERROR]: "The request timed out. Please try again.",
  [ERROR_CODES.UNAUTHORIZED]: "You need to log in to access this feature.",
  [ERROR_CODES.TOKEN_EXPIRED]: "Your session has expired. Please log in again.",
  [ERROR_CODES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again.",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]:
    "Something went wrong on our end. Please try again later.",
  [ERROR_CODES.BOOK_NOT_FOUND]:
    "The book you're looking for could not be found.",
  [ERROR_CODES.LIST_NOT_FOUND]:
    "The reading list you're looking for could not be found.",
} as const;

// Error recovery strategies
export type ErrorRecoveryStrategy =
  | "retry"
  | "refresh"
  | "redirect"
  | "fallback"
  | "ignore";

export interface ErrorRecoveryAction {
  strategy: ErrorRecoveryStrategy;
  label: string;
  action: () => void | Promise<void>;
  isPrimary?: boolean;
}
