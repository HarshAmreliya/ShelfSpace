"use client";

import { useState, useEffect, useCallback } from "react";
import { NavigationPreferences } from "../../../types/navigation";

const NAVIGATION_PREFERENCES_KEY = "shelfspace-navigation-preferences";

const defaultPreferences: NavigationPreferences = {
  isCollapsed: false,
  favoriteItems: [],
  customOrder: undefined,
};

export function useNavigationPreferences() {
  const [preferences, setPreferences] =
    useState<NavigationPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAVIGATION_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn("Failed to load navigation preferences:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback(
    (newPreferences: Partial<NavigationPreferences>) => {
      setPreferences((current) => {
        const updated = { ...current, ...newPreferences };
        try {
          localStorage.setItem(
            NAVIGATION_PREFERENCES_KEY,
            JSON.stringify(updated)
          );
        } catch (error) {
          console.warn("Failed to save navigation preferences:", error);
        }
        return updated;
      });
    },
    [] // Remove preferences dependency to prevent hook order issues
  );

  // Individual preference setters
  const setIsCollapsed = useCallback(
    (isCollapsed: boolean) => {
      savePreferences({ isCollapsed });
    },
    [savePreferences]
  );

  const addFavoriteItem = useCallback(
    (itemName: string) => {
      setPreferences((current) => {
        const favoriteItems = [...current.favoriteItems];
        if (!favoriteItems.includes(itemName)) {
          favoriteItems.push(itemName);
          const updated = { ...current, favoriteItems };
          try {
            localStorage.setItem(
              NAVIGATION_PREFERENCES_KEY,
              JSON.stringify(updated)
            );
          } catch (error) {
            console.warn("Failed to save navigation preferences:", error);
          }
          return updated;
        }
        return current;
      });
    },
    [] // Remove dependencies to prevent hook order issues
  );

  const removeFavoriteItem = useCallback(
    (itemName: string) => {
      setPreferences((current) => {
        const favoriteItems = current.favoriteItems.filter(
          (name) => name !== itemName
        );
        const updated = { ...current, favoriteItems };
        try {
          localStorage.setItem(
            NAVIGATION_PREFERENCES_KEY,
            JSON.stringify(updated)
          );
        } catch (error) {
          console.warn("Failed to save navigation preferences:", error);
        }
        return updated;
      });
    },
    [] // Remove dependencies to prevent hook order issues
  );

  const setCustomOrder = useCallback(
    (customOrder: string[]) => {
      setPreferences((current) => {
        const updated = { ...current, customOrder };
        try {
          localStorage.setItem(
            NAVIGATION_PREFERENCES_KEY,
            JSON.stringify(updated)
          );
        } catch (error) {
          console.warn("Failed to save navigation preferences:", error);
        }
        return updated;
      });
    },
    [] // Remove dependencies to prevent hook order issues
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(NAVIGATION_PREFERENCES_KEY);
    } catch (error) {
      console.warn("Failed to reset navigation preferences:", error);
    }
  }, []);

  return {
    preferences,
    isLoaded,
    setIsCollapsed,
    addFavoriteItem,
    removeFavoriteItem,
    setCustomOrder,
    resetPreferences,
    savePreferences,
  };
}
