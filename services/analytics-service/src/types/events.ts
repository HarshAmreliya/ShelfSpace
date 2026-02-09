export type AnalyticsEventType =
  | "BOOK_ADDED"
  | "BOOK_STATUS_CHANGED"
  | "BOOK_RATED"
  | "BOOK_PROGRESS"
  | "READING_SESSION"
  | "BOOK_FINISHED"
  | "READING_LIST_CREATED"
  | "READING_LIST_UPDATED"
  | "READING_LIST_DELETED"
  | "READING_LIST_BOOKS_MOVED"
  | "READING_LIST_BOOKS_REMOVED"
  | "USER_CREATED"
  | "USER_PROFILE_UPDATED"
  | "USER_PREFERENCES_UPDATED"
  | "USER_STATUS_UPDATED"
  | "USER_PREFERENCES_RESET"
  | "BOOK_CREATED"
  | "BOOK_UPDATED"
  | "BOOK_DELETED"
  | "BOOK_VIEWED"
  | "BOOK_SEARCHED"
  | "FORUM_CREATED"
  | "FORUM_UPDATED"
  | "FORUM_DELETED"
  | "FORUM_JOINED"
  | "FORUM_LEFT"
  | "THREAD_CREATED"
  | "THREAD_UPDATED"
  | "THREAD_DELETED"
  | "POST_CREATED"
  | "POST_UPDATED"
  | "POST_DELETED"
  | "POST_REACTED"
  | "THREAD_REACTED"
  | "CHAT_SESSION_CREATED"
  | "CHAT_SESSION_UPDATED"
  | "CHAT_SESSION_DELETED"
  | "CHAT_MESSAGE_SENT"
  | "CHATBOT_QUERY"
  | "MODERATION_LOG_CREATED"
  | "BOOK_VALIDATION_UPDATED"
  | "ADMIN_USER_STATUS_UPDATED"
  | "ADMIN_PREFERENCES_RESET";

export interface AnalyticsEventPayload {
  bookId?: string;
  title?: string;
  author?: string;
  pages?: number;
  genres?: string[];
  status?: "read" | "currently-reading" | "want-to-read" | string;
  previousStatus?: "read" | "currently-reading" | "want-to-read" | string;
  rating?: number;
  progress?: number;
  minutes?: number;
  listName?: string;
  listId?: string;
  forumId?: string;
  forumName?: string;
  threadId?: string;
  threadTitle?: string;
  postId?: string;
  reaction?: string;
  query?: string;
  messageLength?: number;
  sessionId?: string;
  reason?: string;
  targetUserId?: string;
}

export interface AnalyticsEvent {
  userId: string;
  type: AnalyticsEventType;
  timestamp?: string;
  payload?: AnalyticsEventPayload;
}

export interface ActivityItem {
  id: string;
  type: "read" | "rated" | "added" | "started" | "progress" | "session";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsDocument {
  userId: string;
  stats: {
    totalBooks: number;
    booksRead: number;
    currentlyReading: number;
    wantToRead: number;
    totalPages: number;
    totalReadingMinutes: number;
    totalRating: number;
    ratingCount: number;
    currentStreak: number;
    longestStreak: number;
  };
  monthly: Record<string, { books: number; pages: number; minutes: number }>;
  genres: Record<string, number>;
  ratings: Record<string, number>;
  activity: ActivityItem[];
  goals: {
    yearlyGoal: number;
    monthlyPagesGoal: number;
    monthlyHoursGoal: number;
    targetRating: number;
  };
  createdAt: string;
  updatedAt: string;
}
