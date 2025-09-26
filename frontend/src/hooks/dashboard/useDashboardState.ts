// src/hooks/dashboard/useDashboardState.ts
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DashboardState, DashboardActions } from "../../../types/state";
import { useDashboardData } from "./useDashboardData";

const initialPreferences: DashboardState["preferences"] = {
  showStats: true,
  showRecentActivity: true,
  showRecommendations: true,
  compactView: false,
};

const initialState: Omit<DashboardState, "isLoading" | "error"> = {
  activeSection: "overview",
  preferences: initialPreferences,
  refreshInterval: 300000, // 5 minutes
};

export function useDashboardState() {
  const [state, setState] =
    useState<Omit<DashboardState, "isLoading" | "error">>(initialState);

  // Get dashboard data
  const {
    currentlyReading,
    recommendations,
    readingGroups,
    recentActivity,
    stats,
    isLoading,
    refetch,
  } = useDashboardData();

  const [error, setError] = useState<string | null>(null);

  // Note: Auto-refresh is handled by useDashboardData hook internally
  // Removed auto-refresh logic here to prevent infinite loops

  // Actions
  const setActiveSection = useCallback((section: string) => {
    setState((prev) => ({ ...prev, activeSection: section }));
  }, []);

  const updatePreferences = useCallback(
    (newPreferences: Partial<DashboardState["preferences"]>) => {
      setState((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, ...newPreferences },
      }));
    },
    []
  );

  const setRefreshInterval = useCallback((interval: number) => {
    setState((prev) => ({ ...prev, refreshInterval: interval }));
  }, []);

  const refreshData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const actions = useMemo<DashboardActions>(
    () => ({
      setActiveSection,
      updatePreferences,
      setRefreshInterval,
      refreshData,
    }),
    [setActiveSection, updatePreferences, setRefreshInterval, refreshData]
  );

  // Computed values
  const visibleSections = useMemo(() => {
    const sections = [];
    if (state.preferences.showStats) sections.push("stats");
    if (state.preferences.showRecentActivity) sections.push("activity");
    if (state.preferences.showRecommendations) sections.push("recommendations");
    return sections;
  }, [state.preferences]);

  const statsData = useMemo(() => {
    return {
      totalBooks: stats?.totalBooks || 0,
      booksRead:
        recentActivity?.filter((activity) => activity.type === "finished_book")
          .length || 0,
      readingStreak: 7, // This would come from actual data
      averageRating: 4.2, // This would be calculated from user ratings
      ...stats,
    };
  }, [stats, recentActivity]);

  return {
    // State
    activeSection: state.activeSection,
    preferences: state.preferences,
    refreshInterval: state.refreshInterval,
    isLoading,
    error,

    // Data
    stats: statsData,
    visibleSections,

    // Dashboard specific data
    currentlyReading: currentlyReading || [],
    recommendations: recommendations || [],
    readingGroups: readingGroups || [],
    recentActivity: recentActivity || [],

    // Actions
    actions,
  };
}
