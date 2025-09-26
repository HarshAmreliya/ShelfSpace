import { Book, BookInput } from "@/types/book";
import { ReadingList, ReadingListInput } from "@/types/library";
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

// Mock data imports (will be replaced with API calls in production)
import {
  generateMockBooks,
  mockReadingLists,
  DataTransformer,
} from "./mockData";

/**
 * LibraryService handles all library-related data operations
 * Provides a clean interface for components to interact with library data
 * Includes proper error handling, validation, and data transformation
 */
export class LibraryService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = "/api", timeout = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Get all reading lists for the current user
   */
  async getReadingLists(
    params: GetReadingListsParams = {}
  ): Promise<ServiceResponse<ReadingList[]>> {
    try {
      // In development: return mock data
      // In production: make API call to GET /api/reading-lists

      const lists = [...mockReadingLists];

      // Optionally include books in the response
      if (params.includeBooks) {
        const booksResponse = await this.getBooks({ options: params.options });
        const allBooks = booksResponse.data;

        lists.forEach((list) => {
          list.books = allBooks.filter((book) =>
            list.bookIds.includes(book.id)
          );
        });
      }

      return {
        data: lists,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceError(
        "Failed to fetch reading lists",
        "FETCH_READING_LISTS_ERROR",
        500,
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
      // Get mock books using the new infrastructure
      const mockBooks = generateMockBooks();

      // Apply filters if provided
      let filteredBooks = mockBooks;

      if (params.filter) {
        filteredBooks = this.applyBookFilters(mockBooks, params.filter);
      }

      if (params.listId) {
        const listsResponse = await this.getReadingLists();
        const targetList = listsResponse.data.find(
          (list) => list.id === params.listId
        );
        if (targetList) {
          filteredBooks = filteredBooks.filter((book) =>
            targetList.bookIds.includes(book.id)
          );
        }
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

      return {
        data: paginatedBooks,
        pagination: {
          page,
          limit,
          total: filteredBooks.length,
          totalPages: Math.ceil(filteredBooks.length / limit),
          hasNext: endIndex < filteredBooks.length,
          hasPrev: page > 1,
        },
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceError(
        "Failed to fetch books",
        "FETCH_BOOKS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get a single book by ID
   */
  async getBook(id: ID): Promise<ServiceResponse<Book>> {
    try {
      const booksResponse = await this.getBooks();
      const book = booksResponse.data.find((b) => b.id === id);

      if (!book) {
        throw new NotFoundError("Book", id);
      }

      return {
        data: book,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServiceError(
        `Failed to fetch book with id ${id}`,
        "FETCH_BOOK_ERROR",
        500,
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

      // In production: POST /api/books
      const newBook = DataTransformer.transformBookInputToBook(
        bookInput,
        Date.now().toString()
      );

      return {
        data: newBook,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ServiceError(
        "Failed to create book",
        "CREATE_BOOK_ERROR",
        500,
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

      // Check for name conflicts
      const existingLists = await this.getReadingLists();
      const nameExists = existingLists.data.some(
        (list) => list.name.toLowerCase() === params.list.name.toLowerCase()
      );

      if (nameExists) {
        throw new ConflictError("A reading list with this name already exists");
      }

      // In production: POST /api/reading-lists
      const newList = DataTransformer.transformReadingListInputToReadingList(
        params.list,
        Date.now().toString(),
        "user-1"
      );

      // Set sort order
      newList.sortOrder = existingLists.data.length + 1;

      return {
        data: newList,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new ServiceError(
        "Failed to create reading list",
        "CREATE_READING_LIST_ERROR",
        500,
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
      // Get existing list
      const existingLists = await this.getReadingLists();
      const existingList = existingLists.data.find(
        (list) => list.id === params.id
      );

      if (!existingList) {
        throw new NotFoundError("Reading list", params.id);
      }

      // Validate updates
      if (params.updates.name) {
        this.validateReadingListInput({ name: params.updates.name });

        // Check for name conflicts (excluding current list)
        const nameExists = existingLists.data.some(
          (list) =>
            list.id !== params.id &&
            list.name.toLowerCase() === params.updates.name!.toLowerCase()
        );

        if (nameExists) {
          throw new ConflictError(
            "A reading list with this name already exists"
          );
        }
      }

      // In production: PUT /api/reading-lists/:id
      const updatedList: ReadingList = {
        ...existingList,
        ...params.updates,
        bookCount: params.updates.bookIds?.length ?? existingList.bookCount,
        updatedAt: new Date().toISOString(),
      };

      return {
        data: updatedList,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError
      ) {
        throw error;
      }
      throw new ServiceError(
        `Failed to update reading list with id ${params.id}`,
        "UPDATE_READING_LIST_ERROR",
        500,
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
      // Get existing list
      const existingLists = await this.getReadingLists();
      const existingList = existingLists.data.find(
        (list) => list.id === params.id
      );

      if (!existingList) {
        throw new NotFoundError("Reading list", params.id);
      }

      // Prevent deletion of default lists
      if (existingList.isDefault) {
        throw new ValidationError("Cannot delete default reading lists");
      }

      // In production: DELETE /api/reading-lists/:id
      // For now, just return success

      return {
        data: undefined,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServiceError(
        `Failed to delete reading list with id ${params.id}`,
        "DELETE_READING_LIST_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Move books between reading lists
   */
  async moveBooks(params: MoveBooksParams): Promise<ServiceResponse<void>> {
    try {
      // Validate that target list exists
      const lists = await this.getReadingLists();
      const targetList = lists.data.find(
        (list) => list.id === params.targetListId
      );

      if (!targetList) {
        throw new NotFoundError("Reading list", params.targetListId);
      }

      // Validate that all books exist
      const books = await this.getBooks();
      const existingBookIds = books.data.map((book) => book.id);
      const invalidBookIds = params.bookIds.filter(
        (id) => !existingBookIds.includes(id)
      );

      if (invalidBookIds.length > 0) {
        throw new ValidationError(
          `Books not found: ${invalidBookIds.join(", ")}`
        );
      }

      // In production: POST /api/reading-lists/:id/move-books
      // For now, just return success

      return {
        data: undefined,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServiceError(
        "Failed to move books",
        "MOVE_BOOKS_ERROR",
        500,
        error
      );
    }
  }

  // Private helper methods

  private validateBookInput(input: Partial<BookInput>): void {
    const errors = DataTransformer.validateBookData(input as any);
    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
  }

  private validateReadingListInput(input: Partial<ReadingListInput>): void {
    const errors = DataTransformer.validateReadingListData(input as any);
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
