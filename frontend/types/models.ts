export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating?: number;
  readingProgress?: number;
  status: "reading" | "completed" | "want-to-read" | "paused";
  dateAdded: string;
  lastRead?: string;
  pages?: number;
  genre?: string;
  genres?: string[];
  tags?: string[];
}

export interface Recommendation {
  id: string;
  book: Book;
  reason: string;
  confidence: number;
}

export interface ReadingGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  currentBook?: string;
  nextMeeting?: string;
  isActive: boolean;
}

export interface Activity {
  id: string;
  type:
    | "reading_progress"
    | "book_added"
    | "book_completed"
    | "group_joined"
    | "finished_book";
  description: string;
  timestamp: string;
  bookId?: string;
  groupId?: string;
}

// Book Details Page Types
export interface BookDetail {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number; // average rating 0-5
  ratingsCount: number;
  genres: string[];
  description: string;
}

export interface SimilarBookItem {
  id: number;
  title: string;
  author: string;
  cover: string;
}

export interface DiscussionThread {
  id: number;
  title: string;
  replies: number;
}

export interface UserReview {
  id: number;
  user: string;
  rating: number; // 1-5
  text: string;
  createdAt: string; // ISO string
}
