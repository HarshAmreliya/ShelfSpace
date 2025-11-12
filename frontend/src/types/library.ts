import { Book } from "./book";

// Re-export Book for convenience
export type { Book };

// Define ViewMode for library views
export type ViewMode = "grid" | "list";

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  bookIds: string[];
  bookCount: number;
  isDefault: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  books?: Book[];
}

export interface ReadingListInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  bookIds?: string[];
}

export interface LibraryFilters {
  search: string;
  genre: string | null;
  status: "reading" | "completed" | "want-to-read" | null;
  sortBy: "title" | "author" | "dateAdded" | "rating";
  sortOrder: "asc" | "desc";
}
