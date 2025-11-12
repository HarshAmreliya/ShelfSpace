import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ReadingList } from "../../../types/library";
import { libraryService } from "../../services/libraryService";
import { BaseHookState, UseReadingListsOptions, cacheKeys } from "./types";

/**
 * Hook for fetching and managing reading lists
 * Provides loading states, error handling, and caching
 */
export function useReadingLists(options: UseReadingListsOptions = {}) {
  const {
    enabled = true,
    includeBooks = false,
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<BaseHookState<ReadingList[]>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isValidating: false,
    lastFetched: null,
  });

  const retryCountRef = useRef(0);
  const cacheRef = useRef<
    Map<string, { data: ReadingList[]; timestamp: number }>
  >(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const cacheKey = useMemo(() => JSON.stringify(cacheKeys.readingLists(includeBooks)), [includeBooks]);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!state.lastFetched) return true;
    return Date.now() - state.lastFetched > staleTime;
  }, [state.lastFetched, staleTime]);

  // Get cached data
  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheTime;
    if (isExpired) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [cacheKey, cacheTime]);

  // Set cached data
  const setCachedData = useCallback(
    (data: ReadingList[]) => {
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    },
    [cacheKey]
  );

  // Fetch reading lists
  const fetchReadingLists = useCallback(
    async (isRefetch = false) => {
      // Check cache first if not a manual refetch
      if (!isRefetch) {
        const cachedData = getCachedData();
        if (cachedData && !isStale()) {
          setState((prev) => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isError: false,
            error: null,
            lastFetched: Date.now(),
          }));
          return cachedData;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: !prev.data, // Don't show loading if we have cached data
        isValidating: true,
        isError: false,
        error: null,
      }));

      try {
        const response = await libraryService.getReadingLists({
          includeBooks,
          options: { timeout: 10000 },
        });

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const data = response.data;

        // Cache the data
        setCachedData(data as any);

        setState((prev) => ({
          ...prev,
          data: data as any,
          isLoading: false,
          isValidating: false,
          isError: false,
          error: null,
          lastFetched: Date.now(),
        }));

        retryCountRef.current = 0;
        onSuccess?.(data as any);

        return data as any;
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorObj =
          error instanceof Error ? error : new Error("Unknown error");

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isValidating: false,
          isError: true,
          error: errorObj,
        }));

        onError?.(errorObj);

        // Retry logic
        if (
          retry &&
          retryCountRef.current < (typeof retry === "number" ? retry : 3)
        ) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchReadingLists(isRefetch);
          }, retryDelay * retryCountRef.current);
        }

        throw errorObj;
      }
    },
    [
      includeBooks,
      getCachedData,
      setCachedData,
      isStale,
      onSuccess,
      onError,
      retry,
      retryDelay,
    ]
  );

  // Refetch function
  const refetch = useCallback(() => {
    return fetchReadingLists(true);
  }, [fetchReadingLists]);

  // Mutate function for optimistic updates
  const mutate = useCallback(
    (
      updater:
        | ReadingList[]
        | ((prev: ReadingList[] | null) => ReadingList[] | null),
      shouldRevalidate = true
    ) => {
      setState((prev) => {
        const newData =
          typeof updater === "function" ? updater(prev.data) : updater;
        return {
          ...prev,
          data: newData,
          lastFetched: Date.now(),
        };
      });

      if (shouldRevalidate) {
        fetchReadingLists(true);
      }
    },
    [fetchReadingLists]
  );

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchReadingLists();
    }
  }, [enabled, refetchOnMount]); // Remove fetchReadingLists from dependencies

  // Window focus refetch
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale()) {
        fetchReadingLists();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, refetchOnWindowFocus]); // Remove fetchReadingLists and isStale from dependencies

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    mutate,
    isStale: isStale(),
  };
}
