import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import { getErrorMessage } from "./api";

// Book service API client
const BOOK_SERVICE_BASE_URL = "/api/books";

// Backend book response structure
interface BackendBook {
  _id: string;
  book_id?: string;
  title: string;
  authors: Array<{ name: string; role?: string }>;
  image_url?: string;
  published_year?: number;
  published_date?: string;
  publisher?: string;
  language?: string;
  genres?: string[];
  isbn?: string;
  description?: string;
  pages?: number;
  rating?: number;
  average_rating?: number;
  ratings_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend book structure (matches frontend/src/types/book.ts)
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear?: number;
  publishedDate?: string;
  publisher?: string;
  language?: string;
  genres: string[];
  status: "read" | "currently-reading" | "want-to-read";
  rating?: number;
  pages?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
  format?: string;
  personalNotes?: string;
  notes?: string;
  tags?: string[];
  readingProgress?: number;
  progress: number;
  startedAt?: string;
  finishedAt?: string;
  lastReadAt?: string;
  readAt?: string | null;
  averageRating?: number;
  ratingsCount?: number;
  isPublic?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  addedAt: string;
}

interface PaginatedBooksResponse {
  success: boolean;
  totalBooks: number;
  currentPage: number;
  totalPages: number;
  books: BackendBook[];
}

// Transform backend book to frontend book format
function transformBook(backendBook: BackendBook): Book {
  // Get first author name or "Unknown"
  const authorName =
    backendBook.authors && backendBook.authors.length > 0
      ? backendBook.authors.map((a) => a.name).join(", ")
      : "Unknown Author";

  return {
    id: backendBook.book_id || backendBook._id,
    title: backendBook.title || "Untitled",
    author: authorName,
    isbn: backendBook.isbn,
    publishedYear: backendBook.published_year,
    publishedDate: backendBook.published_date,
    publisher: backendBook.publisher,
    language: backendBook.language,
    genres: backendBook.genres || [],
    status: "want-to-read", // Default status, will be set by reading lists
    rating: backendBook.rating || backendBook.average_rating,
    pages: backendBook.pages,
    description: backendBook.description,
    coverImage: backendBook.image_url,
    cover: backendBook.image_url,
    averageRating: backendBook.average_rating,
    ratingsCount: backendBook.ratings_count,
    progress: 0,
    createdAt: backendBook.createdAt || new Date().toISOString(),
    updatedAt: backendBook.updatedAt || new Date().toISOString(),
    addedAt: backendBook.createdAt || new Date().toISOString(),
  };
}

class BookServiceClient {
  private baseURL: string;

  constructor() {
    this.baseURL = BOOK_SERVICE_BASE_URL;
  }

  // Get headers with auth token
  private async getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      const session = await getSession();
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      // Session not available, continue without auth
    }

    return headers;
  }

  // Get all books with pagination and filters
  async getBooks(params: {
    page?: number;
    limit?: number;
    author?: string;
    genre?: string;
    sortBy?: "asc" | "desc";
    search?: string;
  } = {}): Promise<{ data: Book[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.author) queryParams.append("author", params.author);
      if (params.genre) queryParams.append("genre", params.genre);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.search) queryParams.append("search", params.search);

      const url = `${this.baseURL}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await axios.get<PaginatedBooksResponse>(url, {
        headers: await this.getHeaders(),
      });

      const books = response.data.books.map(transformBook);

      return {
        data: books,
        pagination: {
          page: response.data.currentPage,
          limit: 30, // Book service uses 30 per page
          total: response.data.totalBooks,
          totalPages: response.data.totalPages,
          hasNext: response.data.currentPage < response.data.totalPages,
          hasPrev: response.data.currentPage > 1,
        },
      };
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to fetch books";
      console.error("Error fetching books:", error);
      throw new Error(message);
    }
  }

  // Get a single book by ID
  async getBookById(bookId: string): Promise<Book> {
    try {
      const response = await axios.get<BackendBook>(
        `${this.baseURL}/${bookId}`,
        {
          headers: await this.getHeaders(),
        }
      );
      return transformBook(response.data);
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to fetch book";
      console.error("Error fetching book:", error);
      if (error?.response?.status === 404) {
        throw new Error("Book not found");
      }
      throw new Error(message);
    }
  }

  // Search books
  async searchBooks(query: string, page: number = 1): Promise<{ data: Book[]; pagination: any }> {
    try {
      const response = await axios.get<PaginatedBooksResponse>(
        `${this.baseURL}/search`,
        {
          params: { q: query, page },
          headers: await this.getHeaders(),
        }
      );

      const books = response.data.books.map(transformBook);

      return {
        data: books,
        pagination: {
          page: response.data.currentPage,
          limit: 30,
          total: response.data.totalBooks,
          totalPages: response.data.totalPages,
          hasNext: response.data.currentPage < response.data.totalPages,
          hasPrev: response.data.currentPage > 1,
        },
      };
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to search books";
      console.error("Error searching books:", error);
      throw new Error(message);
    }
  }

  // Get all genres
  async getGenres(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${this.baseURL}/genres`, {
        headers: await this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to fetch genres";
      console.error("Error fetching genres:", error);
      throw new Error(message);
    }
  }

  // Get all authors
  async getAuthors(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${this.baseURL}/authors`, {
        headers: await this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to fetch authors";
      console.error("Error fetching authors:", error);
      throw new Error(message);
    }
  }

  // Get all languages
  async getLanguages(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${this.baseURL}/languages`, {
        headers: await this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      const message = error?.userMessage || error?.response?.data?.error || error?.message || "Failed to fetch languages";
      console.error("Error fetching languages:", error);
      throw new Error(message);
    }
  }
}

// Export singleton instance
export const bookService = new BookServiceClient();

