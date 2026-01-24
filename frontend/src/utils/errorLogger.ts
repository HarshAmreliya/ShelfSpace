/**
 * Error logging and debugging utilities for development and production
 */

import { BaseError, ErrorBreadcrumb, ErrorReport } from "../../types/error";

// Environment detection
const isDevelopment = process.env['NODE_ENV'] === "development";
const isProduction = process.env['NODE_ENV'] === "production";

// Error logger configuration
interface ErrorLoggerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableBreadcrumbs: boolean;
  maxBreadcrumbs: number;
  apiEndpoint?: string | undefined;
  apiKey?: string | undefined;
}

const defaultConfig: ErrorLoggerConfig = {
  enableConsoleLogging: isDevelopment,
  enableRemoteLogging: isProduction,
  enableBreadcrumbs: true,
  maxBreadcrumbs: 50,
  ...(process.env['NEXT_PUBLIC_ERROR_LOGGING_ENDPOINT'] && {
    apiEndpoint: process.env['NEXT_PUBLIC_ERROR_LOGGING_ENDPOINT'],
  }),
  ...(process.env['NEXT_PUBLIC_ERROR_LOGGING_API_KEY'] && {
    apiKey: process.env['NEXT_PUBLIC_ERROR_LOGGING_API_KEY'],
  }),
};

class ErrorLogger {
  private config: ErrorLoggerConfig;
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private sessionId: string;

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Log an error with context and breadcrumbs
   */
  logError(
    error: Error | BaseError,
    context: Record<string, unknown> = {}
  ): void {
    const errorReport = this.createErrorReport(error, context);

    // Console logging for development
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorReport);
    }

    // Remote logging for production
    if (this.config.enableRemoteLogging) {
      this.logToRemote(errorReport);
    }

    // Add to breadcrumbs for future errors
    this.addBreadcrumb({
      timestamp: new Date().toISOString(),
      category: "state-change",
      message: error.message,
      data: { ...context, stack: error.stack },
      level: "error",
    });
  }

  /**
   * Log a warning message
   */
  logWarning(message: string, context: Record<string, unknown> = {}): void {
    const warning = {
      message,
      level: "warning" as const,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.config.enableConsoleLogging) {
      console.warn("[WARNING]", message, context);
    }

    this.addBreadcrumb({
      timestamp: warning.timestamp,
      category: "user-action",
      message,
      data: context,
      level: "warning",
    });
  }

  /**
   * Log an info message
   */
  logInfo(message: string, context: Record<string, unknown> = {}): void {
    const info = {
      message,
      level: "info" as const,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.config.enableConsoleLogging) {
      console.info("[INFO]", message, context);
    }

    this.addBreadcrumb({
      timestamp: info.timestamp,
      category: "user-action",
      message,
      data: context,
      level: "info",
    });
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: ErrorBreadcrumb): void {
    if (!this.config.enableBreadcrumbs) return;

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  /**
   * Get current breadcrumbs
   */
  getBreadcrumbs(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  /**
   * Create a comprehensive error report
   */
  private createErrorReport(
    error: Error | BaseError,
    context: Record<string, unknown>
  ): ErrorReport {
    const baseError: BaseError = this.normalizeError(error);

    return {
      error: baseError,
      context: {
        sessionId: this.sessionId,
        userAgent:
          typeof window !== "undefined" ? window.navigator.userAgent : "server",
        url: typeof window !== "undefined" ? window.location.href : "server",
        timestamp: new Date().toISOString(),
        buildVersion: process.env['NEXT_PUBLIC_BUILD_VERSION'] || "unknown",
        environment: process.env['NODE_ENV'] || "unknown",
        ...context,
      },
      breadcrumbs: this.getBreadcrumbs(),
    };
  }

  /**
   * Normalize any error to BaseError format
   */
  private normalizeError(error: Error | BaseError): BaseError {
    if (this.isBaseError(error)) {
      return error;
    }

    const baseError: BaseError = {
      code: "UNKNOWN_ERROR",
      message: error.message,
      category: "unknown",
      severity: "medium",
      timestamp: new Date().toISOString(),
      details: {
        name: error.name,
        ...(error.stack && { stack: error.stack }),
      },
    };

    if (error.stack) {
      baseError.stack = error.stack;
    }

    return baseError;
  }

  /**
   * Check if error is already a BaseError
   */
  private isBaseError(error: Error | BaseError): error is BaseError {
    return "code" in error && "category" in error && "severity" in error;
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(errorReport: ErrorReport): void {
    console.group(`🚨 Error: ${errorReport.error.message}`);
    console.error("Error Details:", errorReport.error);
    console.error("Context:", errorReport.context);

    if (errorReport.breadcrumbs.length > 0) {
      console.group("Breadcrumbs:");
      errorReport.breadcrumbs.forEach((breadcrumb, index) => {
        const icon =
          breadcrumb.level === "error"
            ? "[ERROR]"
            : breadcrumb.level === "warning"
            ? "[WARNING]"
            : "[INFO]";
        console.log(
          `${icon} ${index + 1}. [${breadcrumb.category}] ${
            breadcrumb.message
          }`,
          breadcrumb.data
        );
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Send error to remote logging service
   */
  private async logToRemote(errorReport: ErrorReport): Promise<void> {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      return;
    }

    try {
      await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(errorReport),
      });
    } catch (remoteError) {
      // Fallback to console if remote logging fails
      console.error("Failed to log error remotely:", remoteError);
      console.error("Original error:", errorReport);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === "undefined") return;

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError(new Error(event.reason), {
        type: "unhandledrejection",
        promise: event.promise,
      });
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      this.logError(event.error || new Error(event.message), {
        type: "global-error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = (
  error: Error | BaseError,
  context?: Record<string, unknown>
) => errorLogger.logError(error, context);

export const logWarning = (
  message: string,
  context?: Record<string, unknown>
) => errorLogger.logWarning(message, context);

export const logInfo = (message: string, context?: Record<string, unknown>) =>
  errorLogger.logInfo(message, context);

export const addBreadcrumb = (breadcrumb: ErrorBreadcrumb) =>
  errorLogger.addBreadcrumb(breadcrumb);

// Development debugging helpers
export const debugHelpers = {
  /**
   * Log component render information
   */
  logRender: (componentName: string, props: Record<string, unknown> = {}) => {
    if (isDevelopment) {
      console.log(`[RENDER] ${componentName}`, props);
      addBreadcrumb({
        timestamp: new Date().toISOString(),
        category: "state-change",
        message: `Component rendered: ${componentName}`,
        data: props,
        level: "info",
      });
    }
  },

  /**
   * Log state changes
   */
  logStateChange: (stateName: string, oldValue: unknown, newValue: unknown) => {
    if (isDevelopment) {
      console.log(`📊 State Change: ${stateName}`, {
        from: oldValue,
        to: newValue,
      });
      addBreadcrumb({
        timestamp: new Date().toISOString(),
        category: "state-change",
        message: `State changed: ${stateName}`,
        data: { oldValue, newValue },
        level: "info",
      });
    }
  },

  /**
   * Log API calls
   */
  logApiCall: (method: string, url: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🌐 API Call: ${method} ${url}`, data);
    }
    addBreadcrumb({
      timestamp: new Date().toISOString(),
      category: "api-call",
      message: `API call: ${method} ${url}`,
      data: { method, url, data },
      level: "info",
    });
  },

  /**
   * Log user actions
   */
  logUserAction: (
    action: string,
    target?: string,
    data?: Record<string, unknown>
  ) => {
    if (isDevelopment) {
      console.log(
        `👤 User Action: ${action}${target ? ` on ${target}` : ""}`,
        data
      );
    }
    const breadcrumb: ErrorBreadcrumb = {
      timestamp: new Date().toISOString(),
      category: "user-action",
      message: `User ${action}${target ? ` on ${target}` : ""}`,
      level: "info",
    };
    if (data) {
      breadcrumb.data = data;
    }
    addBreadcrumb(breadcrumb);
  },

  /**
   * Performance timing helper
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

export default errorLogger;
