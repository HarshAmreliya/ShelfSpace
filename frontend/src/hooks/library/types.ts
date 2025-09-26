// src/hooks/library/types.ts

export interface BaseHookState {
  isLoading: boolean;
  error: Error | null;
}

export interface UseReadingListsOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export const cacheKeys = {
  readingLists: (includeBooks?: boolean) => `reading-lists${includeBooks ? '-with-books' : ''}`,
  books: () => 'books',
  libraryState: () => 'library-state',
} as const;
