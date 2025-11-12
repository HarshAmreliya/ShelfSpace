// src/hooks/data/types.ts

export interface BaseHookState<T = any> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isValidating?: boolean;
  lastFetched?: number | null;
}

export interface UseReadingListsOptions {
  enabled?: boolean;
  includeBooks?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseBookOptions {
  bookId?: string;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseBooksOptions {
  enabled?: boolean;
  listId?: string;
  filter?: any;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface PaginatedHookState<T = any> extends BaseHookState<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  pagination?: any | null;
}

export const cacheKeys = {
  readingLists: (includeBooks?: boolean) => `reading-lists${includeBooks ? '-with-books' : ''}`,
  books: (params?: any) => `books-${JSON.stringify(params || {})}`,
  book: (bookId: string) => `book-${bookId}`,
  libraryState: () => 'library-state',
} as const;

export interface MutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => void;
}

export interface MutationState {
  isLoading: boolean;
  error: Error | null;
}

export interface Mutation<TData = any, TVariables = any> {
  mutate: (variables: TVariables, options?: MutationOptions<TData, TVariables>) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
}

export interface LibraryActionsHook {
  createBook: Mutation<any, any>;
  updateBook: Mutation<any, any>;
  deleteBook: Mutation<void, any>;
  createReadingList: Mutation<any, any>;
  updateReadingList: Mutation<any, any>;
  deleteReadingList: Mutation<void, any>;
  moveBooks: Mutation<void, any>;
  invalidateBooks: () => void;
  invalidateReadingLists: () => void;
  invalidateAll: () => void;
}
