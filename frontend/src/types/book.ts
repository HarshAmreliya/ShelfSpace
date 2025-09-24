export type BookStatus = "read" | "currently-reading" | "want-to-read";

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
  status: BookStatus;
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

export interface BookInput {
  title: string;
  author: string;
  isbn?: string;
  publishedYear?: number;
  publishedDate?: string;
  publisher?: string;
  language?: string;
  genres?: string[];
  status?: BookStatus;
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
  isPublic?: boolean;
  isFavorite?: boolean;
}
