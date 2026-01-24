import { Book } from "./book";

export interface BookReview {
  id: string;
  bookId: string;
  author: string;
  authorId: string;
  title: string;
  content: string;
  rating: number; // 1-5 stars
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  helpful: number;
  notHelpful: number;
}

export interface BookDiscussion {
  id: string;
  bookId: string;
  author: string;
  authorId: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  tags: string[];
}

export interface BookDetail extends Book {
  // Extended book details for the detail page
  isbn?: string;
  publisher?: string;
  language?: string;
  pageCount?: number;
  publicationDate?: string;
  averageRating?: number;
  ratingsCount?: number;
  reviewsCount?: number;
  discussionsCount?: number;
  isPublic?: boolean;
  isFavorite?: boolean;
  personalNotes?: string;
  readingProgress?: number;
  startedAt?: string;
  finishedAt?: string;
  lastReadAt?: string;
}
