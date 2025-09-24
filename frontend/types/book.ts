import { BaseEntity, ID, Timestamp } from "./common";

// Book status enum
export type BookStatus =
  | "want-to-read"
  | "currently-reading"
  | "read"
  | "did-not-finish"
  | "on-hold";

// Book format enum
export type BookFormat = "physical" | "ebook" | "audiobook";

// Genre type
export type Genre =
  | "fiction"
  | "non-fiction"
  | "mystery"
  | "romance"
  | "sci-fi"
  | "fantasy"
  | "biography"
  | "history"
  | "self-help"
  | "business"
  | "science"
  | "philosophy"
  | "poetry"
  | "drama"
  | "thriller"
  | "horror"
  | "young-adult"
  | "children"
  | "memoir"
  | "travel"
  | "cooking"
  | "art"
  | "religion"
  | "politics"
  | "health"
  | "technology";

// Main Book interface
export interface Book extends BaseEntity {
  title: string;
  author: string;
  isbn?: string;
  cover: string;
  description?: string;
  pages?: number;
  publishedDate?: string;
  publisher?: string;
  language?: string;
  genres: Genre[];
  tags: string[];

  // User-specific fields
  status: BookStatus;
  format: BookFormat;
  rating?: number; // 1-5 stars
  personalNotes?: string;
  readingProgress: number; // 0-100 percentage
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
  lastReadAt?: Timestamp;

  // Metadata
  averageRating?: number;
  ratingsCount?: number;
  isPublic: boolean;
  isFavorite: boolean;
}

// Book creation/update payload
export interface BookInput {
  title: string;
  author: string;
  isbn?: string;
  cover?: string;
  description?: string;
  pages?: number;
  publishedDate?: string;
  publisher?: string;
  language?: string;
  genres?: Genre[];
  tags?: string[];
  status?: BookStatus;
  format?: BookFormat;
  rating?: number;
  personalNotes?: string;
  readingProgress?: number;
  isPublic?: boolean;
  isFavorite?: boolean;
}

// Book search/filter interface
export interface BookFilter {
  search?: string;
  status?: BookStatus[];
  genres?: Genre[];
  format?: BookFormat[];
  rating?: number;
  author?: string;
  tags?: string[];
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  sortBy?:
    | "title"
    | "author"
    | "rating"
    | "dateAdded"
    | "lastRead"
    | "progress";
  sortOrder?: "asc" | "desc";
}

// Book recommendation interface
export interface BookRecommendation extends BaseEntity {
  book: Book;
  reason: string;
  confidence: number; // 0-1
  source: "ai" | "user" | "similar-books" | "trending";
  isAccepted?: boolean;
  isRejected?: boolean;
}

// Book review interface
export interface BookReview extends BaseEntity {
  bookId: ID;
  userId: ID;
  rating: number; // 1-5
  title?: string;
  content: string;
  isPublic: boolean;
  helpfulCount: number;
  user?: {
    id: ID;
    name: string;
    avatar?: string;
  };
}

// Book discussion thread
export interface BookDiscussion extends BaseEntity {
  bookId: ID;
  title: string;
  content: string;
  authorId: ID;
  replyCount: number;
  lastReplyAt?: Timestamp;
  isSticky: boolean;
  isLocked: boolean;
  tags: string[];
}

// Similar books interface
export interface SimilarBook {
  book: Book;
  similarity: number; // 0-1
  reasons: string[];
}

// Book statistics
export interface BookStats {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksWantToRead: number;
  averageRating: number;
  totalPages: number;
  pagesRead: number;
  readingStreak: number;
  favoriteGenres: Genre[];
  readingGoal?: {
    target: number;
    current: number;
    period: "daily" | "weekly" | "monthly" | "yearly";
  };
}
