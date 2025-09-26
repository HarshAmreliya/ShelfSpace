"use client";

import { useCallback } from "react";
import { Book, ReadingList } from "../../types/library";
import { useLibraryActions as useLibraryActionsData } from "../data/useLibraryActions";

interface UseLibraryActionsProps {
  onBookUpdate?: (book: Book) => void;
  onListUpdate?: (list: ReadingList) => void;
  onError?: (error: Error) => void;
}

export function useLibraryActions({
  onBookUpdate,
  onListUpdate,
  onError,
}: UseLibraryActionsProps = {}) {
  const {
    addBookToList,
    removeBookFromList,
    updateBookProgress,
    updateBookRating,
    createReadingList,
    updateReadingList,
    deleteReadingList,
  } = useLibraryActionsData();

  // Book actions
  const handleAddBookToList = useCallback(
    async (book: Book, listId: string) => {
      try {
        const updatedBook = await addBookToList(book.id, listId);
        onBookUpdate?.(updatedBook);
        return updatedBook;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [addBookToList, onBookUpdate, onError]
  );

  const handleRemoveBookFromList = useCallback(
    async (bookId: string, listId: string) => {
      try {
        await removeBookFromList(bookId, listId);
        // Note: In a real implementation, you might want to return the updated book
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [removeBookFromList, onError]
  );

  const handleUpdateBookProgress = useCallback(
    async (bookId: string, progress: number) => {
      try {
        const updatedBook = await updateBookProgress(bookId, progress);
        onBookUpdate?.(updatedBook);
        return updatedBook;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [updateBookProgress, onBookUpdate, onError]
  );

  const handleUpdateBookRating = useCallback(
    async (bookId: string, rating: number) => {
      try {
        const updatedBook = await updateBookRating(bookId, rating);
        onBookUpdate?.(updatedBook);
        return updatedBook;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [updateBookRating, onBookUpdate, onError]
  );

  // Reading list actions
  const handleCreateReadingList = useCallback(
    async (listData: Omit<ReadingList, "id" | "books">) => {
      try {
        const newList = await createReadingList(listData);
        onListUpdate?.(newList);
        return newList;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [createReadingList, onListUpdate, onError]
  );

  const handleUpdateReadingList = useCallback(
    async (listId: string, updates: Partial<ReadingList>) => {
      try {
        const updatedList = await updateReadingList(listId, updates);
        onListUpdate?.(updatedList);
        return updatedList;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [updateReadingList, onListUpdate, onError]
  );

  const handleDeleteReadingList = useCallback(
    async (listId: string) => {
      try {
        await deleteReadingList(listId);
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [deleteReadingList, onError]
  );

  // Navigation actions
  const handleViewBook = useCallback((book: Book) => {
    // Navigate to book detail page
    window.location.href = `/book/${book.id}`;
  }, []);

  const handleEditBook = useCallback((book: Book) => {
    // Open book edit modal or navigate to edit page
    console.log("Edit book:", book.id);
    // TODO: Implement book editing functionality
  }, []);

  return {
    // Book actions
    addBookToList: handleAddBookToList,
    removeBookFromList: handleRemoveBookFromList,
    updateBookProgress: handleUpdateBookProgress,
    updateBookRating: handleUpdateBookRating,
    viewBook: handleViewBook,
    editBook: handleEditBook,

    // Reading list actions
    createReadingList: handleCreateReadingList,
    updateReadingList: handleUpdateReadingList,
    deleteReadingList: handleDeleteReadingList,
  };
}
