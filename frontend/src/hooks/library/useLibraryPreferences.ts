"use client";

import { useState, useEffect, useCallback } from "react";
import { ViewMode, LibraryFilters } from "../../types/library";

interface LibraryPreferences {
  viewMode: ViewMode;
  selectedList: string;
  filters: Partial<LibraryFilters>;
}

const DEFAULT_PREFERENCES: LibraryPreferences = {
  viewMode: "grid",
  selectedList: "1",
  filters: {
    search: "",
    genre: null,
    status: null,
    sortBy: "title",
    sortOrder: "asc",
  },
};

const STORAGE_KEY = "shelfspace-library-preferences";

export function useLibraryPreferences() {
  const [preferences, setPreferences] =
    useState<LibraryPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn("Failed to load library preferences:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save library preferences:", error);
    }
  }, [preferences, isLoaded]);

  // Update functions
  const updateViewMode = useCallback((viewMode: ViewMode) => {
    setPreferences((prev) => ({ ...prev, viewMode }));
  }, []);

  const updateSelectedList = useCallback((selectedList: string) => {
    setPreferences((prev) => ({ ...prev, selectedList }));
  }, []);

  const updateFilters = useCallback((filters: Partial<LibraryFilters>) => {
    setPreferences((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const clearStoredPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      console.warn("Failed to clear library preferences:", error);
    }
  }, []);

  return {
    preferences,
    isLoaded,
    updateViewMode,
    updateSelectedList,
    updateFilters,
    resetPreferences,
    clearStoredPreferences,
  };
}
