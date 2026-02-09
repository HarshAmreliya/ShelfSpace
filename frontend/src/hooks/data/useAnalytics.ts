import { useState, useEffect, useCallback } from "react";
import {
  getDashboardSummary,
  getReadingAnalytics,
  getReadingGoals,
  getActivityTimeline,
  type DashboardSummary,
  type ReadingAnalyticsResponse,
  type ReadingGoalsResponse,
  type ActivityTimelineResponse,
} from "@/lib/analytics-service";

interface UseAnalyticsState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

function useAnalyticsQuery<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<UseAnalyticsState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Failed to load analytics");
      setState({ data: null, isLoading: false, error: errorObj });
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    refetch: load,
  };
}

export function useDashboardSummary() {
  return useAnalyticsQuery<DashboardSummary>(getDashboardSummary);
}

export function useReadingAnalyticsData() {
  return useAnalyticsQuery<ReadingAnalyticsResponse>(getReadingAnalytics);
}

export function useReadingGoalsData() {
  return useAnalyticsQuery<ReadingGoalsResponse>(getReadingGoals);
}

export function useActivityTimelineData() {
  return useAnalyticsQuery<ActivityTimelineResponse>(getActivityTimeline);
}
