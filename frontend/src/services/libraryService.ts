import { Book, BookInput } from "@/types/book";
import { ReadingList as BaseReadingList, ReadingListInput } from "../../types/library";
import { ID } from "@/types/common";
import {
  ServiceResponse,
  PaginatedResponse,
  GetBooksParams,
  GetReadingListsParams,
  UpdateBookParams,
  CreateReadingListParams,
  UpdateReadingListParams,
  DeleteReadingListParams,
  MoveBooksParams,
  ServiceError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "./types";
import { bookService } from "@/lib/book-service";
import { getSession } from "next-auth/react";
import axios from "axios";

// ReadingList type that uses the correct Book type
type ReadingList = Omit<BaseReadingList, 'books'> & {
  books?: Book[];
};

// Library service API client
const LIBRARY_SERVICE_BASE_URL = "/api/library/reading-lists";

/**
 * LibraryService handles all library-related data operations
 * Provides a clean interface for components to interact with library data
 * Includes proper error handling, validation, and data transformation
 */
export class LibraryService {
  private baseUrl: string;

  constructor(baseUrl = "/api", _timeout = 5000) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all reading lists for the current user
   */
  async getReadingLists(
    params: GetReadingListsParams = {}
  ): Promise<ServiceResponse<ReadingList[]>> {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      const url = `${LIBRARY_SERVICE_BASE_URL}${params.includeBooks ? "?includeBooks=true" : ""}`;
      const response = await axios.get<ReadingList[]>(url, { headers });

      // Optionally include books in the response
      if (params.includeBooks && response.data) {
        // Fetch books efficiently by fetching them in parallel for each list
        // For now, we'll fetch all books and filter - in production, consider a batch endpoint
        try {
          const allBooksResponse = await this.getBooks(params.options ? { options: params.options } : {});
          const allBooks = allBooksResponse.data;

          response.data.forEach((list) => {
            list.books = allBooks.filter((book) =>
              list.bookIds.includes(book.id)
            );
          });
        } catch (err) {
          // If book fetching fails, still return lists without books
          console.warn("Failed to fetch books for reading lists:", err);
          response.data.forEach((list) => {
            list.books = [];
          });
        }
      }

      return {
        data: response.data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new ServiceError(
        "Failed to fetch reading lists",
        "FETCH_READING_LISTS_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Get books with optional filtering and pagination
   */
  async getBooks(
    params: GetBooksParams = {}
  ): Promise<PaginatedResponse<Book>> {
    try {
      let booksResponse;

      // If filtering by listId, get books from reading list first
      if (params.listId) {
        const listsResponse = await this.getReadingLists({ includeBooks: false });
        const targetList = listsResponse.data.find(
          (list) => list.id === params.listId
        );
        if (targetList && targetList.bookIds.length > 0) {
          // Fetch books by IDs from reading list
          // Note: We'll need to fetch all and filter, or add a batch endpoint
          booksResponse = await bookService.getBooks({
            page: params.page || 1,
            limit: params.limit || 20,
            sortBy: params.filter?.sortOrder === "desc" ? "desc" : "asc",
          });
          // Filter to only books in the list
          booksResponse.data = booksResponse.data.filter((book) =>
            targetList.bookIds.includes(book.id)
          );
        } else {
          // Empty list
          return {
            data: [],
            pagination: {
              page: params.page || 1,
              limit: params.limit || 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            success: true,
            timestamp: new Date().toISOString(),
          };
        }
      } else if (params.filter?.search) {
        // Use search endpoint if search query provided
        booksResponse = await bookService.searchBooks(
          params.filter.search,
          params.page || 1
        );
      } else {
        // Get all books with filters
        const getBooksParams: any = {
          page: params.page || 1,
          limit: params.limit || 20,
          sortBy: params.filter?.sortOrder === "desc" ? "desc" : "asc",
        };
        
        // Only add optional properties if they have values
        if (params.filter?.author) {
          getBooksParams.author = params.filter.author;
        }
        if (params.filter?.search) {
          getBooksParams.search = params.filter.search;
        }
        
        booksResponse = await bookService.getBooks(getBooksParams);
      }

      // Apply additional client-side filters if needed
      let filteredBooks = booksResponse.data;
      if (params.filter) {
        filteredBooks = this.applyBookFilters(filteredBooks, params.filter);
      }

      return {
        data: filteredBooks,
        pagination: booksResponse.pagination,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new ServiceError(
        "Failed to fetch books",
        "FETCH_BOOKS_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Get a single book by ID
   */
  async getBook(id: ID): Promise<ServiceResponse<Book>> {
    try {
      const book = await bookService.getBookById(String(id));

      return {
        data: book,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError("Book", id);
      }
      throw new ServiceError(
        `Failed to fetch book with id ${id}`,
        "FETCH_BOOK_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Create a new book
   */
  async createBook(bookInput: BookInput): Promise<ServiceResponse<Book>> {
    try {
      // Validate required fields
      this.validateBookInput(bookInput);

      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      // Transform to backend format
      const backendBook = {
        title: bookInput.title,
        authors: [{ name: bookInput.author }],
        description: bookInput.description,
        genres: bookInput.genres || [],
        isbn13: bookInput.isbn,
        num_pages: bookInput.pages,
        publication_year: bookInput.publishedYear?.toString(),
        language_code: bookInput.language,
        image_url: bookInput.coverImage || bookInput.cover,
      };

      const response = await axios.post(`${this.baseUrl}/books`, backendBook, { headers });
      const book = response.data;

      // Transform back to frontend format
      const frontendBook: Book = {
        id: book.book_id || book._id,
        title: bookInput.title,
        author: book.authors?.[0]?.name || bookInput.author || "Unknown",
        ...(bookInput.description && { description: bookInput.description }),
        ...(bookInput.coverImage && { coverImage: bookInput.coverImage }),
        ...(bookInput.cover && { cover: bookInput.cover }),
        ...(bookInput.isbn && { isbn: bookInput.isbn }),
        ...(bookInput.pages && { pages: bookInput.pages }),
        ...(bookInput.publishedYear && { publishedYear: bookInput.publishedYear }),
        ...(bookInput.language && { language: bookInput.language }),
        genres: bookInput.genres || [],
        ...(bookInput.rating && { rating: bookInput.rating }),
        tags: bookInput.tags || [],
        status: "want-to-read",
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      };

      return {
        data: frontendBook,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ServiceError(
        "Failed to create book",
        "CREATE_BOOK_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Update an existing book
   */
  async updateBook(params: UpdateBookParams): Promise<ServiceResponse<Book>> {
    try {
      // Get existing book
      const existingBookResponse = await this.getBook(params.id);
      const existingBook = existingBookResponse.data;

      // Validate updates
      if (
        params.updates.title !== undefined ||
        params.updates.author !== undefined
      ) {
        this.validateBookInput({
          title: params.updates.title || existingBook.title,
          author: params.updates.author || existingBook.author,
        });
      }

      // In production: PUT /api/books/:id
      const updatedBook: Book = {
        ...existingBook,
        ...params.updates,
        updatedAt: new Date().toISOString(),
      };

      return {
        data: updatedBook,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServiceError(
        `Failed to update book with id ${params.id}`,
        "UPDATE_BOOK_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Delete a book
   */
  async deleteBook(id: ID): Promise<ServiceResponse<void>> {
    try {
      // Check if book exists
      await this.getBook(id);

      // In production: DELETE /api/books/:id
      // For now, just return success

      return {
        data: undefined,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServiceError(
        `Failed to delete book with id ${id}`,
        "DELETE_BOOK_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Create a new reading list
   */
  async createReadingList(
    params: CreateReadingListParams
  ): Promise<ServiceResponse<ReadingList>> {
    try {
      // Validate required fields
      this.validateReadingListInput(params.list);

      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      const response = await axios.post<ReadingList>(
        LIBRARY_SERVICE_BASE_URL,
        params.list,
        { headers }
      );

      return {
        data: response.data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error.response?.status === 409) {
        throw new ConflictError("A reading list with this name already exists");
      }
      throw new ServiceError(
        "Failed to create reading list",
        "CREATE_READING_LIST_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Update an existing reading list
   */
  async updateReadingList(
    params: UpdateReadingListParams
  ): Promise<ServiceResponse<ReadingList>> {
    try {
      // Validate updates
      if (params.updates.name) {
        this.validateReadingListInput({ name: params.updates.name });
      }

      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      const response = await axios.put<ReadingList>(
        `${LIBRARY_SERVICE_BASE_URL}/${params.id}`,
        params.updates,
        { headers }
      );

      return {
        data: response.data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error.response?.status === 404) {
        throw new NotFoundError("Reading list", params.id);
      }
      if (error.response?.status === 409) {
        throw new ConflictError("A reading list with this name already exists");
      }
      throw new ServiceError(
        `Failed to update reading list with id ${params.id}`,
        "UPDATE_READING_LIST_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Delete a reading list
   */
  async deleteReadingList(
    params: DeleteReadingListParams
  ): Promise<ServiceResponse<void>> {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      await axios.delete(`${LIBRARY_SERVICE_BASE_URL}/${params.id}`, { headers });

      return {
        data: undefined,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError("Reading list", params.id);
      }
      if (error.response?.status === 400) {
        throw new ValidationError("Cannot delete default reading lists");
      }
      throw new ServiceError(
        `Failed to delete reading list with id ${params.id}`,
        "DELETE_READING_LIST_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  /**
   * Move books between reading lists
   */
  async moveBooks(params: MoveBooksParams): Promise<ServiceResponse<void>> {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      // Extract source list ID from params (assuming it's in the URL path)
      // The API expects: POST /reading-lists/:id/move-books
      // We need to know which list to move FROM - this should be in params
      const sourceListId = (params as any).sourceListId || params.targetListId;
      
      await axios.post(
        `${LIBRARY_SERVICE_BASE_URL}/${sourceListId}/move-books`,
        {
          bookIds: params.bookIds,
          targetListId: params.targetListId,
        },
        { headers }
      );

      return {
        data: undefined,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError("Reading list", params.targetListId);
      }
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ServiceError(
        "Failed to move books",
        "MOVE_BOOKS_ERROR",
        error.response?.status || 500,
        error
      );
    }
  }

  // Private helper methods

  private validateBookInput(input: Partial<BookInput>): void {
    const errors: string[] = [];
    if (!input.title || input.title.trim().length === 0) {
      errors.push("Title is required");
    }
    if (!input.author || input.author.trim().length === 0) {
      errors.push("Author is required");
    }
    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
  }

  private validateReadingListInput(input: Partial<ReadingListInput>): void {
    const errors: string[] = [];
    if (input.name && input.name.trim().length === 0) {
      errors.push("Name cannot be empty");
    }
    if (input.name && input.name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }
    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
  }

  private applyBookFilters(books: Book[], filter: any): Book[] {
    let filtered = books;

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter((book) => filter.status.includes(book.status));
    }

    if (filter.genres && filter.genres.length > 0) {
      filtered = filtered.filter((book) =>
        book.genres.some((genre) => filter.genres.includes(genre))
      );
    }

    if (filter.rating) {
      filtered = filtered.filter(
        (book) => book.rating && book.rating >= filter.rating
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filter.sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "author":
            aValue = a.author.toLowerCase();
            bValue = b.author.toLowerCase();
            break;
          case "rating":
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case "dateAdded":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filter.sortOrder === "desc" ? 1 : -1;
        if (aValue > bValue) return filter.sortOrder === "desc" ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }
}

// Export singleton instance
export const libraryService = new LibraryService();
