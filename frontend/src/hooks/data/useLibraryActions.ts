import { useState, useCallback, useRef } from "react";
import { Book, BookInput } from "../../../types/book";
import { ReadingList, ReadingListInput } from "../../../types/library";
import { ID } from "../../../types/common";
import { libraryService } from "../../services/libraryService";
import { LibraryActionsHook, MutationOptions } from "./types";

/**
 * Hook for library mutation actions (create, update, delete)
 * Provides loading states, error handling, and optimistic updates
 */
export function useLibraryActions(): LibraryActionsHook {
  // Book mutation states
  const [createBookState, setCreateBookState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  const [updateBookState, setUpdateBookState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  const [deleteBookState, setDeleteBookState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  // Reading list mutation states
  const [createReadingListState, setCreateReadingListState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  const [updateReadingListState, setUpdateReadingListState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  const [deleteReadingListState, setDeleteReadingListState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  const [moveBooksState, setMoveBooksState] = useState({
    isLoading: false,
    error: null as Error | null,
  });

  // Cache invalidation callbacks
  const invalidationCallbacksRef = useRef<{
    books: (() => void)[];
    readingLists: (() => void)[];
  }>({
    books: [],
    readingLists: [],
  });

  // Register invalidation callbacks
  const registerInvalidation = useCallback(
    (type: "books" | "readingLists", callback: () => void) => {
      invalidationCallbacksRef.current[type].push(callback);

      // Return cleanup function
      return () => {
        const callbacks = invalidationCallbacksRef.current[type];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    },
    []
  );

  // Invalidation functions
  const invalidateBooks = useCallback(() => {
    invalidationCallbacksRef.current.books.forEach((callback) => callback());
  }, []);

  const invalidateReadingLists = useCallback(() => {
    invalidationCallbacksRef.current.readingLists.forEach((callback) =>
      callback()
    );
  }, []);

  const invalidateAll = useCallback(() => {
    invalidateBooks();
    invalidateReadingLists();
  }, [invalidateBooks, invalidateReadingLists]);

  // Book mutations
  const createBook = useCallback(
    async (
      input: BookInput,
      options?: MutationOptions<Book, BookInput>
    ): Promise<Book> => {
      setCreateBookState({ isLoading: true, error: null });

      try {
        const response = await libraryService.createBook(input);
        const book = response.data;

        setCreateBookState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateBooks();
        invalidateReadingLists(); // Lists might need to update book counts

        options?.onSuccess?.(book, input);
        options?.onSettled?.(book, null, input);

        return book;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Failed to create book");

        setCreateBookState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, input);
        options?.onSettled?.(undefined, errorObj, input);

        throw errorObj;
      }
    },
    [invalidateBooks, invalidateReadingLists]
  );

  const updateBook = useCallback(
    async (
      params: { id: ID; updates: Partial<BookInput> },
      options?: MutationOptions<Book, { id: ID; updates: Partial<BookInput> }>
    ): Promise<Book> => {
      setUpdateBookState({ isLoading: true, error: null });

      try {
        const response = await libraryService.updateBook(params);
        const book = response.data;

        setUpdateBookState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateBooks();

        options?.onSuccess?.(book, params);
        options?.onSettled?.(book, null, params);

        return book;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Failed to update book");

        setUpdateBookState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, params);
        options?.onSettled?.(undefined, errorObj, params);

        throw errorObj;
      }
    },
    [invalidateBooks]
  );

  const deleteBook = useCallback(
    async (id: ID, options?: MutationOptions<void, ID>): Promise<void> => {
      setDeleteBookState({ isLoading: true, error: null });

      try {
        await libraryService.deleteBook(id);

        setDeleteBookState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateBooks();
        invalidateReadingLists(); // Lists might need to update book counts

        options?.onSuccess?.(undefined, id);
        options?.onSettled?.(undefined, null, id);
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Failed to delete book");

        setDeleteBookState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, id);
        options?.onSettled?.(undefined, errorObj, id);

        throw errorObj;
      }
    },
    [invalidateBooks, invalidateReadingLists]
  );

  // Reading list mutations
  const createReadingList = useCallback(
    async (
      input: ReadingListInput,
      options?: MutationOptions<ReadingList, ReadingListInput>
    ): Promise<ReadingList> => {
      setCreateReadingListState({ isLoading: true, error: null });

      try {
        const response = await libraryService.createReadingList({
          list: input,
        });
        const readingList = response.data;

        setCreateReadingListState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateReadingLists();

        options?.onSuccess?.(readingList, input);
        options?.onSettled?.(readingList, null, input);

        return readingList;
      } catch (error) {
        const errorObj =
          error instanceof Error
            ? error
            : new Error("Failed to create reading list");

        setCreateReadingListState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, input);
        options?.onSettled?.(undefined, errorObj, input);

        throw errorObj;
      }
    },
    [invalidateReadingLists]
  );

  const updateReadingList = useCallback(
    async (
      params: { id: ID; updates: Partial<ReadingListInput> },
      options?: MutationOptions<
        ReadingList,
        { id: ID; updates: Partial<ReadingListInput> }
      >
    ): Promise<ReadingList> => {
      setUpdateReadingListState({ isLoading: true, error: null });

      try {
        const response = await libraryService.updateReadingList(params);
        const readingList = response.data;

        setUpdateReadingListState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateReadingLists();

        options?.onSuccess?.(readingList, params);
        options?.onSettled?.(readingList, null, params);

        return readingList;
      } catch (error) {
        const errorObj =
          error instanceof Error
            ? error
            : new Error("Failed to update reading list");

        setUpdateReadingListState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, params);
        options?.onSettled?.(undefined, errorObj, params);

        throw errorObj;
      }
    },
    [invalidateReadingLists]
  );

  const deleteReadingList = useCallback(
    async (id: ID, options?: MutationOptions<void, ID>): Promise<void> => {
      setDeleteReadingListState({ isLoading: true, error: null });

      try {
        await libraryService.deleteReadingList({ id });

        setDeleteReadingListState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateReadingLists();

        options?.onSuccess?.(undefined, id);
        options?.onSettled?.(undefined, null, id);
      } catch (error) {
        const errorObj =
          error instanceof Error
            ? error
            : new Error("Failed to delete reading list");

        setDeleteReadingListState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, id);
        options?.onSettled?.(undefined, errorObj, id);

        throw errorObj;
      }
    },
    [invalidateReadingLists]
  );

  const moveBooks = useCallback(
    async (
      params: { bookIds: ID[]; targetListId: ID; sourceListId?: ID },
      options?: MutationOptions<
        void,
        { bookIds: ID[]; targetListId: ID; sourceListId?: ID }
      >
    ): Promise<void> => {
      setMoveBooksState({ isLoading: true, error: null });

      try {
        await libraryService.moveBooks(params);

        setMoveBooksState({ isLoading: false, error: null });

        // Invalidate relevant caches
        invalidateBooks();
        invalidateReadingLists();

        options?.onSuccess?.(undefined, params);
        options?.onSettled?.(undefined, null, params);
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Failed to move books");

        setMoveBooksState({ isLoading: false, error: errorObj });

        options?.onError?.(errorObj, params);
        options?.onSettled?.(undefined, errorObj, params);

        throw errorObj;
      }
    },
    [invalidateBooks, invalidateReadingLists]
  );

  return {
    // Book mutations
    createBook: {
      mutate: createBook,
      isLoading: createBookState.isLoading,
      error: createBookState.error,
    },
    updateBook: {
      mutate: updateBook,
      isLoading: updateBookState.isLoading,
      error: updateBookState.error,
    },
    deleteBook: {
      mutate: deleteBook,
      isLoading: deleteBookState.isLoading,
      error: deleteBookState.error,
    },

    // Reading list mutations
    createReadingList: {
      mutate: createReadingList,
      isLoading: createReadingListState.isLoading,
      error: createReadingListState.error,
    },
    updateReadingList: {
      mutate: updateReadingList,
      isLoading: updateReadingListState.isLoading,
      error: updateReadingListState.error,
    },
    deleteReadingList: {
      mutate: deleteReadingList,
      isLoading: deleteReadingListState.isLoading,
      error: deleteReadingListState.error,
    },
    moveBooks: {
      mutate: moveBooks,
      isLoading: moveBooksState.isLoading,
      error: moveBooksState.error,
    },

    // Utility functions
    invalidateBooks,
    invalidateReadingLists,
    invalidateAll,
  };
}
