// src/utils/storageErrorHandling.ts
export class StorageError extends Error {
  constructor(
    message: string,
    public operation: "read" | "write" | "remove",
    public key?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export interface StorageErrorHandler {
  onQuotaExceeded?: (key: string, value: any) => void;
  onSecurityError?: (key: string) => void;
  onGeneralError?: (error: StorageError) => void;
}

export class StorageManager {
  private errorHandler: StorageErrorHandler;

  constructor(errorHandler: StorageErrorHandler = {}) {
    this.errorHandler = {
      onQuotaExceeded: errorHandler.onQuotaExceeded || this.defaultQuotaHandler,
      onSecurityError:
        errorHandler.onSecurityError || this.defaultSecurityHandler,
      onGeneralError: errorHandler.onGeneralError || this.defaultErrorHandler,
    };
  }

  private defaultQuotaHandler = (key: string, value: any) => {
    console.warn(
      `Storage quota exceeded when saving ${key}. Attempting cleanup...`
    );
    this.cleanupOldEntries();
  };

  private defaultSecurityHandler = (key: string) => {
    console.warn(`Security error accessing storage for key: ${key}`);
  };

  private defaultErrorHandler = (error: StorageError) => {
    console.error(
      `Storage error (${error.operation}):`,
      error.message,
      error.originalError
    );
  };

  private cleanupOldEntries() {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      const entries = keys.map((key) => ({
        key,
        timestamp: this.getTimestamp(key),
        size: localStorage.getItem(key)?.length || 0,
      }));

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries until we free up some space
      let removedSize = 0;
      const targetSize = 1024 * 1024; // 1MB

      for (const entry of entries) {
        if (removedSize >= targetSize) break;

        try {
          localStorage.removeItem(entry.key);
          removedSize += entry.size;
          console.log(
            `Removed old storage entry: ${entry.key} (${entry.size} bytes)`
          );
        } catch (error) {
          // Continue with next entry if removal fails
        }
      }
    } catch (error) {
      console.error("Failed to cleanup storage:", error);
    }
  }

  private getTimestamp(key: string): number {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        return parsed.timestamp || 0;
      }
    } catch (error) {
      // If we can't parse, assume it's old
      return 0;
    }
    return 0;
  }

  // Safe storage operations with error handling
  setItem(key: string, value: any): boolean {
    if (typeof window === "undefined") return false;

    try {
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
      });

      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      const storageError = new StorageError(
        `Failed to set item: ${key}`,
        "write",
        key,
        error as Error
      );

      if (error instanceof DOMException) {
        if (error.code === DOMException.QUOTA_EXCEEDED_ERR) {
          this.errorHandler.onQuotaExceeded?.(key, value);

          // Try again after cleanup
          try {
            localStorage.setItem(
              key,
              JSON.stringify({ data: value, timestamp: Date.now() })
            );
            return true;
          } catch (retryError) {
            this.errorHandler.onGeneralError?.(storageError);
          }
        } else if (error.code === DOMException.SECURITY_ERR) {
          this.errorHandler.onSecurityError?.(key);
        }
      }

      this.errorHandler.onGeneralError?.(storageError);
      return false;
    }
  }

  getItem<T>(key: string, defaultValue?: T): T | undefined {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      const parsed = JSON.parse(item);
      return parsed.data !== undefined ? parsed.data : parsed; // Handle both new and old formats
    } catch (error) {
      const storageError = new StorageError(
        `Failed to get item: ${key}`,
        "read",
        key,
        error as Error
      );

      this.errorHandler.onGeneralError?.(storageError);
      return defaultValue;
    }
  }

  removeItem(key: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      const storageError = new StorageError(
        `Failed to remove item: ${key}`,
        "remove",
        key,
        error as Error
      );

      this.errorHandler.onGeneralError?.(storageError);
      return false;
    }
  }

  // Check if storage is available
  isAvailable(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage usage information
  getUsageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } | null {
    if (typeof window === "undefined" || !this.isAvailable()) return null;

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return { used, available, percentage };
    } catch (error) {
      return null;
    }
  }
}

// Global storage manager instance
let globalStorageManager: StorageManager | null = null;

export function getStorageManager(
  errorHandler?: StorageErrorHandler
): StorageManager {
  if (!globalStorageManager) {
    globalStorageManager = new StorageManager(errorHandler);
  }
  return globalStorageManager;
}
