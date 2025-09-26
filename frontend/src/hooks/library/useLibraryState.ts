// src/hooks/library/useLibraryState.ts
"use client";

import { useState, useCallback, useMemo } from "react";
import { LibraryState, LibraryActions } from "../../../types/state";
import { useReadingLists } from "../data/useReadingLists";
import { validateLibraryState } from "../../utils/stateValidation";

const defaultFilters: LibraryState["filters"] = {
  search: "",
  genre: null,
  status: null,
  sortBy: "title",
  sortOrder: "asc",
};

const initialState: Omit<LibraryState, "isLoading" | "error"> = {
  selectedList: "1",
  viewMode: "grid",
  filters: defaultFilters,
  selectedBooks: [],
};

export function useLibraryState(searchParams?: { [key: string]: string | string[] | undefined }) {
  const [state, setState] = useState<Omit<LibraryState, "isLoading" | "error">>(
    () => {
      // Initialize from URL search params if provided
      if (searchParams) {
        const getParam = (key: string) => {
          const value = searchParams[key];
          return Array.isArray(value) ? value[0] : value;
        };
        
        return {
          ...initialState,
          selectedList: getParam("list") || initialState.selectedList,
          viewMode:
            (getParam("view") as "grid" | "list") ||
            initialState.viewMode,
          filters: {
            ...initialState.filters,
            search: getParam("search") || "",
            genre: getParam("genre") || null,
            status: getParam("status") || null,
          },
        };
      }
      return initialState;
    }
  );

  // Get reading lists data
  const { data: readingLists, isLoading, error } = useReadingLists({ includeBooks: true });

  // Actions
  const setSelectedList = useCallback((listId: string) => {
    setState((prev) => ({ ...prev, selectedList: listId }));
  }, []);

  const setViewMode = useCallback((mode: "grid" | "list") => {
    try {
      validateLibraryState({ viewMode: mode });
      setState((prev) => ({ ...prev, viewMode: mode }));
    } catch (error) {
      console.error("Failed to set view mode:", error);
    }
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<LibraryState["filters"]>) => {
      setState((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...newFilters },
      }));
    },
    []
  );

  const toggleBookSelection = useCallback((bookId: string) => {
    setState((prev) => ({
      ...prev,
      selectedBooks: prev.selectedBooks.includes(bookId)
        ? prev.selectedBooks.filter((id) => id !== bookId)
        : [...prev.selectedBooks, bookId],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedBooks: [] }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: defaultFilters }));
  }, []);

  const actions = useMemo<LibraryActions>(
    () => ({
      setSelectedList,
      setViewMode,
      updateFilters,
      toggleBookSelection,
      clearSelection,
      resetFilters,
    }),
    [
      setSelectedList,
      setViewMode,
      updateFilters,
      toggleBookSelection,
      clearSelection,
      resetFilters,
    ]
  );

  // Computed values
  const selectedListData = useMemo(() => {
    return readingLists?.find((list) => list.id === state.selectedList);
  }, [readingLists, state.selectedList]);

  const filteredBooks = useMemo(() => {
    if (!selectedListData?.books) return [];

    let filtered = [...selectedListData.books];

    // Apply search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm)
      );
    }

    // Apply genre filter
    if (state.filters.genre) {
      filtered = filtered.filter((book) =>
        book.genres?.includes(state.filters.genre as any)
      );
    }

    // Apply status filter
    if (state.filters.status) {
      filtered = filtered.filter(
        (book) => book.status === state.filters.status
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[state.filters.sortBy as keyof typeof a] || "";
      const bValue = b[state.filters.sortBy as keyof typeof b] || "";

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return state.filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [selectedListData, state.filters]);

  // Extract unique genres from all books
  const genres = useMemo(() => {
    if (!readingLists) return [];
    const allBooks = readingLists.flatMap(list => list.books || []);
    const uniqueGenres = new Set(allBooks.flatMap(book => book.genres || []));
    return Array.from(uniqueGenres).sort();
  }, [readingLists]);

  return {
    // State
    selectedList: state.selectedList,
    viewMode: state.viewMode,
    filters: state.filters,
    selectedBooks: state.selectedBooks,
    isLoading,
    error,

    // Data
    readingLists: readingLists || [],
    selectedListData,
    filteredBooks,
    genres,

    // Actions
    actions,
  };
}
