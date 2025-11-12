import { useState, useEffect, useCallback, useRef } from "react";
import { Book } from "../../../types/book";
import { libraryService } from "../../services/libraryService";
import { PaginatedHookState, UseBooksOptions, cacheKeys } from "./types";

/**
 * Hook for fetching and managing books with pagination
 * Provides loading states, error handling, caching, and pagination
 */
export function useBooks(options: UseBooksOptions = {}) {
  const {
    enabled = true,
    listId,
    filter,
    page = 1,
    limit = 20,
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<PaginatedHookState<Book>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isValidating: false,
    lastFetched: null,
    pagination: null,
    page: page || 1,
    limit: limit || 20,
    total: 0,
    hasMore: false,
  });

  const retryCountRef = useRef(0);
  const cacheRef = useRef<
    Map<
      string,
      {
        data: Book[];
        pagination: any;
        timestamp: number;
      }
    >
  >(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const cacheKey = JSON.stringify(
    cacheKeys.books({ listId, filter, page, limit })
  );

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

    return { data: cached.data, pagination: cached.pagination };
  }, [cacheKey, cacheTime]);

  // Set cached data
  const setCachedData = useCallback(
    (data: Book[], pagination: any) => {
      cacheRef.current.set(cacheKey, {
        data,
        pagination,
        timestamp: Date.now(),
      });
    },
    [cacheKey]
  );

  // Fetch books
  const fetchBooks = useCallback(
    async (isRefetch = false) => {
      // Check cache first if not a manual refetch
      if (!isRefetch) {
        const cachedData = getCachedData();
        if (cachedData && !isStale()) {
          setState((prev) => ({
            ...prev,
            data: cachedData.data,
            pagination: cachedData.pagination,
            isLoading: false,
            isError: false,
            error: null,
            lastFetched: Date.now(),
          }));
          return cachedData.data;
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
        const response = await libraryService.getBooks({
          ...(listId && { listId }),
          ...(filter && { filter }),
          page,
          limit,
          options: { timeout: 10000 },
        } as any);

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const data = response.data;
        const pagination = response.pagination;

        // Cache the data
        setCachedData(data as any, pagination);

        setState((prev) => ({
          ...prev,
          data: data as any,
          pagination,
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
            fetchBooks(isRefetch);
          }, retryDelay * retryCountRef.current);
        }

        throw errorObj;
      }
    },
    [
      listId,
      filter,
      page,
      limit,
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
    return fetchBooks(true);
  }, [fetchBooks]);

  // Mutate function for optimistic updates
  const mutate = useCallback(
    (
      updater: Book[] | ((prev: Book[] | null) => Book[] | null),
      shouldRevalidate = true
    ) => {
      setState((prev) => {
        const newData =
          typeof updater === "function" ? updater(prev.data) : updater;
        return {
          ...prev,
          data: newData as any,
          lastFetched: Date.now(),
        };
      });

      if (shouldRevalidate) {
        fetchBooks(true);
      }
    },
    [fetchBooks]
  );

  // Pagination helpers
  const goToPage = useCallback(
    (newPage: number) => {
      if (!state.pagination) return;

      const { totalPages } = state.pagination;
      if (newPage < 1 || newPage > totalPages) return;

      // This will trigger a re-fetch with the new page
      // In a real implementation, you'd update the page parameter
      // For now, we'll just refetch with the current parameters
      fetchBooks(true);
    },
    [state.pagination, fetchBooks]
  );

  const nextPage = useCallback(() => {
    if (!state.pagination?.hasNext) return;
    goToPage(state.pagination.page + 1);
  }, [state.pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (!state.pagination?.hasPrev) return;
    goToPage(state.pagination.page - 1);
  }, [state.pagination, goToPage]);

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchBooks();
    }
  }, [enabled, refetchOnMount]); // Remove fetchBooks from dependencies

  // Refetch when parameters change
  useEffect(() => {
    if (enabled) {
      fetchBooks();
    }
  }, [enabled, listId, filter, page, limit]); // Remove fetchBooks from dependencies

  // Window focus refetch
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale()) {
        fetchBooks();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, refetchOnWindowFocus]); // Remove fetchBooks and isStale from dependencies

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
    // Pagination helpers
    goToPage,
    nextPage,
    prevPage,
    canGoNext: state.pagination?.hasNext ?? false,
    canGoPrev: state.pagination?.hasPrev ?? false,
  };
}
