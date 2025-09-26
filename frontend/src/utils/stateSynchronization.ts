// src/utils/stateSynchronization.ts
"use client";

export interface SyncOptions {
  key: string;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

export class StateSynchronizer {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      // Listen for storage events from other tabs
      window.addEventListener("storage", this.handleStorageEvent.bind(this));

      // Listen for custom events from same tab
      window.addEventListener(
        "state-sync",
        this.handleCustomEvent.bind(this) as EventListener
      );
    }
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        this.notifyListeners(event.key, data);
      } catch (error) {
        console.error("Failed to parse storage event data:", error);
      }
    }
  }

  private handleCustomEvent(event: CustomEvent) {
    const { key, data } = event.detail;
    this.notifyListeners(key, data);
  }

  private notifyListeners(key: string, data: any) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error("Error in state sync listener:", error);
        }
      });
    }
  }

  // Subscribe to state changes for a specific key
  subscribe(key: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Broadcast state change to other tabs and components
  broadcast(key: string, data: any, options: Omit<SyncOptions, "key"> = {}) {
    const { debounceMs = 100, onError = console.error } = options;

    // Clear existing debounce timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // Store in localStorage for cross-tab sync
          localStorage.setItem(key, JSON.stringify(data));

          // Dispatch custom event for same-tab sync
          window.dispatchEvent(
            new CustomEvent("state-sync", {
              detail: { key, data },
            })
          );
        }
      } catch (error) {
        onError(error as Error);
      } finally {
        this.debounceTimers.delete(key);
      }
    }, debounceMs);

    this.debounceTimers.set(key, timer);
  }

  // Get current value from localStorage
  getValue(key: string): any | null {
    if (typeof window === "undefined") return null;

    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Failed to get value from localStorage:", error);
      return null;
    }
  }

  // Remove value and notify listeners
  removeValue(key: string) {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
        this.broadcast(key, null);
      } catch (error) {
        console.error("Failed to remove value from localStorage:", error);
      }
    }
  }

  // Clean up resources
  destroy() {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent.bind(this));
      window.removeEventListener(
        "state-sync",
        this.handleCustomEvent.bind(this) as EventListener
      );
    }

    // Clear all timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    this.listeners.clear();
  }
}

// Global instance
let globalSynchronizer: StateSynchronizer | null = null;

export function getStateSynchronizer(): StateSynchronizer {
  if (!globalSynchronizer) {
    globalSynchronizer = new StateSynchronizer();
  }
  return globalSynchronizer;
}

// Hook for using state synchronization
export function useStateSynchronization(key: string, initialData?: any) {
  const synchronizer = getStateSynchronizer();

  const subscribe = (listener: (data: any) => void) => {
    return synchronizer.subscribe(key, listener);
  };

  const broadcast = (data: any, options?: Omit<SyncOptions, "key">) => {
    synchronizer.broadcast(key, data, options);
  };

  const getValue = () => {
    return synchronizer.getValue(key) ?? initialData;
  };

  const removeValue = () => {
    synchronizer.removeValue(key);
  };

  return {
    subscribe,
    broadcast,
    getValue,
    removeValue,
  };
}
