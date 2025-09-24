// src/hooks/useLocalStorage.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serializer?: {
    parse: (value: string) => T;
    stringify: (value: T) => string;
  };
  onError?: (error: Error) => void;
}

export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [
  T | undefined,
  (value: T | ((prev: T | undefined) => T)) => void,
  () => void
] {
  const {
    defaultValue,
    serializer = {
      parse: JSON.parse,
      stringify: JSON.stringify,
    },
    onError = console.error,
  } = options;

  // Get initial value from localStorage
  const getStoredValue = useCallback((): T | undefined => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return serializer.parse(item);
    } catch (error) {
      onError(error as Error);
      return defaultValue;
    }
  }, [key, defaultValue, serializer, onError]);

  const [storedValue, setStoredValue] = useState<T | undefined>(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          if (valueToStore === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(
              key,
              serializer.stringify(valueToStore)
            );
          }
        }

        // Dispatch custom event for cross-tab synchronization
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("localStorage-change", {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, storedValue, serializer, onError]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(undefined);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent("localStorage-change", {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, onError]);

  // Listen for changes in localStorage (cross-tab synchronization)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          onError(error as Error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(defaultValue);
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "localStorage-change",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorage-change",
        handleCustomStorageChange as EventListener
      );
    };
  }, [key, defaultValue, serializer, onError]);

  // Sync with localStorage on mount
  useEffect(() => {
    const currentValue = getStoredValue();
    if (currentValue !== storedValue) {
      setStoredValue(currentValue);
    }
  }, [getStoredValue, storedValue]);

  return [storedValue, setValue, removeValue];
}
