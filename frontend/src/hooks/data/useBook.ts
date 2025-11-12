import { useState, useEffect, useCallback, useRef } from "react";
import { Book } from "../../../types/book";
import { libraryService } from "../../services/libraryService";
import { BaseHookState, UseBookOptions, cacheKeys } from "./types";

/**
 * Hook for fetching a single book by ID
 * Provides loading states, error handling, and caching
 */
export function useBook(
  bookId: string,
  options: Omit<UseBookOptions, "bookId"> = {}
) {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<BaseHookState<Book>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isValidating: false,
    lastFetched: null,
  });

  const retryCountRef = useRef(0);
  const cacheRef = useRef<Map<string, { data: Book; timestamp: number }>>(
    new Map()
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const cacheKey = JSON.stringify(cacheKeys.book(bookId));

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
    (data: Book) => {
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    },
    [cacheKey]
  );

  // Fetch book
  const fetchBook = useCallback(
    async (isRefetch = false) => {
      if (!bookId) {
        setState((prev) => ({
          ...prev,
          data: null,
          isLoading: false,
          isError: false,
          error: null,
        }));
        return;
      }

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
        const response = await libraryService.getBook(bookId);

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
        onSuccess?.(data);

        return data;
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
            fetchBook(isRefetch);
          }, retryDelay * retryCountRef.current);
        }

        throw errorObj;
      }
    },
    [
      bookId,
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
    return fetchBook(true);
  }, [fetchBook]);

  // Mutate function for optimistic updates
  const mutate = useCallback(
    (
      updater: Book | ((prev: Book | null) => Book | null),
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
        fetchBook(true);
      }
    },
    [fetchBook]
  );

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount && bookId) {
      fetchBook();
    }
  }, [enabled, refetchOnMount, bookId]); // Remove fetchBook from dependencies

  // Refetch when bookId changes
  useEffect(() => {
    if (enabled && bookId) {
      fetchBook();
    }
  }, [enabled, bookId]);

  // Window focus refetch
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus || !bookId) return;

    const handleFocus = () => {
      if (isStale()) {
        fetchBook();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, refetchOnWindowFocus, bookId]); // Remove fetchBook and isStale from dependencies

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
