// src/hooks/usePersistedState.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useStateSynchronization } from "../utils/stateSynchronization";

export interface UsePersistedStateOptions<T> {
  defaultValue?: T;
  syncAcrossTabs?: boolean;
  debounceMs?: number;
  onError?: (error: Error) => void;
  validator?: (value: any) => value is T;
}

export function usePersistedState<T>(
  key: string,
  options: UsePersistedStateOptions<T> = {}
): [
  T | undefined,
  (value: T | ((prev: T | undefined) => T)) => void,
  () => void
] {
  const {
    defaultValue,
    syncAcrossTabs = true,
    debounceMs = 100,
    onError = console.error,
    validator,
  } = options;

  // Use localStorage hook
  const [storedValue, setStoredValue, removeStoredValue] = useLocalStorage(
    key,
    {
      defaultValue,
      onError,
    }
  );

  // State synchronization
  const { subscribe, broadcast } = useStateSynchronization(key);

  // Track if we're currently updating to prevent infinite loops
  const isUpdatingRef = useRef(false);

  // Local state for immediate updates
  const [localValue, setLocalValue] = useState<T | undefined>(storedValue);

  // Validate value if validator is provided
  const validateValue = useCallback(
    (value: any): T | undefined => {
      if (validator && value !== undefined) {
        return validator(value) ? value : defaultValue;
      }
      return value;
    },
    [validator, defaultValue]
  );

  // Update function that handles both local and persisted state
  const setValue = useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      if (isUpdatingRef.current) return;

      try {
        const newValue = value instanceof Function ? value(localValue) : value;
        const validatedValue = validateValue(newValue);

        // Update local state immediately
        setLocalValue(validatedValue);

        // Update persisted state
        setStoredValue(validatedValue);

        // Broadcast to other tabs if enabled
        if (syncAcrossTabs) {
          isUpdatingRef.current = true;
          broadcast(validatedValue, { debounceMs, onError });
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, debounceMs + 10);
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [
      localValue,
      validateValue,
      setStoredValue,
      syncAcrossTabs,
      broadcast,
      debounceMs,
      onError,
    ]
  );

  // Remove function
  const removeValue = useCallback(() => {
    setLocalValue(undefined);
    removeStoredValue();

    if (syncAcrossTabs) {
      broadcast(null, { debounceMs, onError });
    }
  }, [removeStoredValue, syncAcrossTabs, broadcast, debounceMs, onError]);

  // Subscribe to cross-tab changes
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const unsubscribe = subscribe((data: T) => {
      if (!isUpdatingRef.current) {
        const validatedValue = validateValue(data);
        setLocalValue(validatedValue);
      }
    });

    return unsubscribe;
  }, [subscribe, syncAcrossTabs, validateValue]);

  // Sync local state with stored value when it changes
  useEffect(() => {
    if (!isUpdatingRef.current && storedValue !== localValue) {
      const validatedValue = validateValue(storedValue);
      setLocalValue(validatedValue);
    }
  }, [storedValue, localValue, validateValue]);

  return [localValue, setValue, removeValue];
}

// Specialized hooks for common use cases
export function usePersistedPreferences<T extends Record<string, any>>(
  key: string,
  defaultPreferences: T
) {
  return usePersistedState(key, {
    defaultValue: defaultPreferences,
    syncAcrossTabs: true,
    validator: (value): value is T => {
      return typeof value === "object" && value !== null;
    },
  });
}

export function usePersistedSettings<T>(
  key: string,
  defaultSettings: T,
  validator?: (value: any) => value is T
) {
  return usePersistedState(key, {
    defaultValue: defaultSettings,
    syncAcrossTabs: true,
    debounceMs: 500, // Longer debounce for settings
    validator,
  });
}
