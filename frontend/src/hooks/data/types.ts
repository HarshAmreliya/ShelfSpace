// src/hooks/data/types.ts

export interface BaseHookState {
  isLoading: boolean;
  error: Error | null;
}

export interface UseReadingListsOptions {
  enabled?: boolean;
  includeBooks?: boolean;
  refetchOnMount?: boolean;
}

export const cacheKeys = {
  readingLists: (includeBooks?: boolean) => `reading-lists${includeBooks ? '-with-books' : ''}`,
  books: () => 'books',
  libraryState: () => 'library-state',
} as const;
