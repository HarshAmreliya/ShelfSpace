export interface BookDetail {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  cover: string;
  description?: string;
  pages?: number;
  publishedDate?: string;
  publisher?: string;
  language: string;
  genres: string[];
  tags: string[];
  status: string;
  format: string;
  rating?: number;
  personalNotes?: string;
  readingProgress: number;
  startedAt?: string;
  finishedAt?: string;
  lastReadAt?: string;
  averageRating?: number;
  ratingsCount: number;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SimilarBookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  similarity: number;
}

export interface DiscussionThread {
  id: string;
  bookId: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface UserReview {
  id: string;
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  helpful: number;
}
