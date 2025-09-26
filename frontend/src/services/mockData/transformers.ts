import { Book, BookInput, BookStatus } from "../../../types/book";
import { ReadingList, ReadingListInput } from "../../../types/library";
import {
  BookDetail,
  SimilarBookItem,
  DiscussionThread,
  UserReview,
} from "../../../types/models";
import { ID } from "../../../types/common";

// Mock data for testing
export const mockBookDetails: BookDetail = {
  id: "1",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  isbn: "9780743273565",
  cover: "/book-covers/great-gatsby.jpg",
  description: "A classic American novel about the Jazz Age.",
  pages: 180,
  publishedDate: "1925-04-10",
  publisher: "Scribner",
  language: "en",
  genres: ["Classic Literature", "Fiction"],
  tags: ["classic", "american-literature"],
  status: "completed",
  format: "physical",
  rating: 4.2,
  personalNotes: "A timeless classic about the American Dream.",
  readingProgress: 100,
  startedAt: "2024-01-01T00:00:00Z",
  finishedAt: "2024-01-15T00:00:00Z",
  lastReadAt: "2024-01-15T00:00:00Z",
  averageRating: 4.2,
  ratingsCount: 1250,
  isPublic: true,
  isFavorite: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
};

export const mockSimilarBooks: SimilarBookItem[] = [
  {
    id: "2",
    title: "The Sun Also Rises",
    author: "Ernest Hemingway",
    cover: "/book-covers/sun-also-rises.jpg",
    rating: 4.0,
    similarity: 0.85,
  },
  {
    id: "3",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/book-covers/mockingbird.jpg",
    rating: 4.5,
    similarity: 0.78,
  },
];

export const mockDiscussions: DiscussionThread[] = [
  {
    id: "1",
    bookId: "1",
    title: "The symbolism of the green light",
    author: "John Doe",
    content: "What do you think the green light represents?",
    createdAt: "2024-01-10T00:00:00Z",
    replies: [
      {
        id: "1-1",
        author: "Jane Smith",
        content: "I think it represents Gatsby's hope and dreams.",
        createdAt: "2024-01-11T00:00:00Z",
      },
    ],
  },
];

export const mockReviews: UserReview[] = [
  {
    id: "1",
    bookId: "1",
    userId: "user1",
    username: "BookLover123",
    rating: 5,
    title: "A masterpiece of American literature",
    content: "This book captures the essence of the Jazz Age perfectly.",
    createdAt: "2024-01-05T00:00:00Z",
    helpful: 12,
  },
];

export const mockReadingLists = [
  {
    id: "1",
    name: "Classic Literature",
    description: "Timeless classics",
    books: [],
    isPublic: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const generateMockBooks = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `book-${i + 1}`,
    title: `Book ${i + 1}`,
    author: `Author ${i + 1}`,
    cover: `/book-covers/book-${i + 1}.jpg`,
    rating: 4.0 + Math.random(),
    status: "want-to-read",
    pages: 200 + Math.floor(Math.random() * 300),
  }));
};

// API Response transformation utilities
export class DataTransformer {
  // Transform API book response to internal Book interface
  static transformApiBookToBook(apiBook: any): Book {
    return {
      id: apiBook.id?.toString() || "",
      title: apiBook.title || "",
      author: apiBook.author || "",
      isbn: apiBook.isbn,
      cover: apiBook.cover || "/book-covers/default.jpg",
      description: apiBook.description,
      pages: apiBook.pages,
      publishedDate: apiBook.published_date || apiBook.publishedDate,
      publisher: apiBook.publisher,
      language: apiBook.language || "en",
      genres: Array.isArray(apiBook.genres) ? apiBook.genres : [],
      tags: Array.isArray(apiBook.tags) ? apiBook.tags : [],
      status: apiBook.status || "want-to-read",
      format: apiBook.format || "physical",
      rating: apiBook.rating,
      personalNotes: apiBook.personal_notes || apiBook.personalNotes,
      readingProgress: apiBook.reading_progress || apiBook.readingProgress || 0,
      startedAt: apiBook.started_at || apiBook.startedAt,
      finishedAt: apiBook.finished_at || apiBook.finishedAt,
      lastReadAt: apiBook.last_read_at || apiBook.lastReadAt,
      averageRating: apiBook.average_rating || apiBook.averageRating,
      ratingsCount: apiBook.ratings_count || apiBook.ratingsCount || 0,
      isPublic: apiBook.is_public ?? apiBook.isPublic ?? true,
      isFavorite: apiBook.is_favorite ?? apiBook.isFavorite ?? false,
      createdAt:
        apiBook.created_at || apiBook.createdAt || new Date().toISOString(),
      updatedAt:
        apiBook.updated_at || apiBook.updatedAt || new Date().toISOString(),
    };
  }

  // Transform internal Book to API format
  static transformBookToApiFormat(book: Book): any {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      cover: book.cover,
      description: book.description,
      pages: book.pages,
      published_date: book.publishedDate,
      publisher: book.publisher,
      language: book.language,
      genres: book.genres,
      tags: book.tags,
      status: book.status,
      format: book.format,
      rating: book.rating,
      personal_notes: book.personalNotes,
      reading_progress: book.readingProgress,
      started_at: book.startedAt,
      finished_at: book.finishedAt,
      last_read_at: book.lastReadAt,
      average_rating: book.averageRating,
      ratings_count: book.ratingsCount,
      is_public: book.isPublic,
      is_favorite: book.isFavorite,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
    };
  }

  // Transform BookInput to Book (for creation)
  static transformBookInputToBook(input: BookInput, id: ID): Book {
    const now = new Date().toISOString();

    return {
      id,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      cover: input.cover || "/book-covers/default.jpg",
      description: input.description,
      pages: input.pages,
      publishedDate: input.publishedDate,
      publisher: input.publisher,
      language: input.language || "en",
      genres: input.genres || [],
      tags: input.tags || [],
      status: input.status || "want-to-read",
      format: input.format || "physical",
      rating: input.rating,
      personalNotes: input.personalNotes,
      readingProgress: input.readingProgress || 0,
      startedAt: input.status === "currently-reading" ? now : undefined,
      finishedAt: input.status === "read" ? now : undefined,
      lastReadAt: input.status === "currently-reading" ? now : undefined,
      averageRating: undefined,
      ratingsCount: 0,
      isPublic: input.isPublic ?? true,
      isFavorite: input.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Transform API reading list response to internal ReadingList interface
  static transformApiReadingListToReadingList(apiList: any): ReadingList {
    return {
      id: apiList.id?.toString() || "",
      name: apiList.name || "",
      description: apiList.description,
      color: apiList.color || "#3B82F6",
      icon: apiList.icon || "BookOpen",
      isDefault: apiList.is_default ?? apiList.isDefault ?? false,
      isPublic: apiList.is_public ?? apiList.isPublic ?? false,
      userId: apiList.user_id || apiList.userId || "",
      bookIds: Array.isArray(apiList.book_ids || apiList.bookIds)
        ? (apiList.book_ids || apiList.bookIds).map((id: any) => id.toString())
        : [],
      books: apiList.books
        ? apiList.books.map(this.transformApiBookToBook)
        : undefined,
      bookCount: apiList.book_count ?? apiList.bookCount ?? 0,
      sortOrder: apiList.sort_order ?? apiList.sortOrder ?? 0,
      createdAt:
        apiList.created_at || apiList.createdAt || new Date().toISOString(),
      updatedAt:
        apiList.updated_at || apiList.updatedAt || new Date().toISOString(),
    };
  }

  // Transform internal ReadingList to API format
  static transformReadingListToApiFormat(list: ReadingList): any {
    return {
      id: list.id,
      name: list.name,
      description: list.description,
      color: list.color,
      icon: list.icon,
      is_default: list.isDefault,
      is_public: list.isPublic,
      user_id: list.userId,
      book_ids: list.bookIds,
      book_count: list.bookCount,
      sort_order: list.sortOrder,
      created_at: list.createdAt,
      updated_at: list.updatedAt,
    };
  }

  // Transform ReadingListInput to ReadingList (for creation)
  static transformReadingListInputToReadingList(
    input: ReadingListInput,
    id: ID,
    userId: ID
  ): ReadingList {
    const now = new Date().toISOString();

    return {
      id,
      name: input.name,
      description: input.description,
      color: input.color || "#3B82F6",
      icon: input.icon || "BookOpen",
      isDefault: false,
      isPublic: input.isPublic ?? false,
      userId,
      bookIds: input.bookIds || [],
      bookCount: input.bookIds?.length || 0,
      sortOrder: 0, // Will be set by service
      createdAt: now,
      updatedAt: now,
    };
  }

  // Transform legacy BookDetail to new Book interface
  static transformLegacyBookDetailToBook(
    bookDetail: BookDetail,
    status: BookStatus = "want-to-read",
    progress: number = 0
  ): Book {
    const now = new Date().toISOString();

    return {
      id: bookDetail.id.toString(),
      title: bookDetail.title,
      author: bookDetail.author,
      isbn: undefined,
      cover: bookDetail.cover,
      description: bookDetail.description,
      pages: undefined,
      publishedDate: undefined,
      publisher: undefined,
      language: "en",
      genres: bookDetail.genres.map(this.transformGenreString) as any[],
      tags: [],
      status,
      format: "physical",
      rating: undefined,
      personalNotes: undefined,
      readingProgress: progress,
      startedAt: status === "currently-reading" ? now : undefined,
      finishedAt: status === "read" ? now : undefined,
      lastReadAt: status === "currently-reading" ? now : undefined,
      averageRating: bookDetail.rating,
      ratingsCount: bookDetail.ratingsCount,
      isPublic: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Transform genre strings to standardized format
  private static transformGenreString(genre: string): string {
    const genreMap: Record<string, string> = {
      Classic: "fiction",
      Fiction: "fiction",
      Literature: "fiction",
      Dystopian: "sci-fi",
      "Science Fiction": "sci-fi",
      Political: "politics",
      Historical: "history",
      "Coming of Age": "fiction",
      "Self-Help": "self-help",
      Productivity: "self-help",
      Psychology: "science",
      Business: "business",
      Design: "art",
      Technology: "technology",
      Fantasy: "fantasy",
      Adventure: "fiction",
      Magic: "fantasy",
      Space: "sci-fi",
      History: "history",
      Anthropology: "science",
      Philosophy: "philosophy",
      Memoir: "memoir",
      Biography: "biography",
      Education: "self-help",
      Entrepreneurship: "business",
      Management: "business",
    };

    return genreMap[genre] || genre.toLowerCase().replace(/\s+/g, "-");
  }

  // Batch transformation utilities
  static transformApiBookArrayToBooks(apiBooks: any[]): Book[] {
    return apiBooks.map(this.transformApiBookToBook);
  }

  static transformApiReadingListArrayToReadingLists(
    apiLists: any[]
  ): ReadingList[] {
    return apiLists.map(this.transformApiReadingListToReadingList);
  }

  // Validation utilities
  static validateBookData(book: Partial<Book>): string[] {
    const errors: string[] = [];

    if (!book.title || book.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!book.author || book.author.trim().length === 0) {
      errors.push("Author is required");
    }

    if (book.rating !== undefined && (book.rating < 1 || book.rating > 5)) {
      errors.push("Rating must be between 1 and 5");
    }

    if (
      book.readingProgress !== undefined &&
      (book.readingProgress < 0 || book.readingProgress > 100)
    ) {
      errors.push("Reading progress must be between 0 and 100");
    }

    return errors;
  }

  static validateReadingListData(list: Partial<ReadingList>): string[] {
    const errors: string[] = [];

    if (!list.name || list.name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (list.name && list.name.trim().length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    return errors;
  }

  // Utility for handling different date formats
  static normalizeDate(date: string | Date | undefined): string | undefined {
    if (!date) return undefined;

    try {
      return new Date(date).toISOString();
    } catch {
      return undefined;
    }
  }

  // Utility for handling different ID formats
  static normalizeId(id: string | number): string {
    return id.toString();
  }
}
