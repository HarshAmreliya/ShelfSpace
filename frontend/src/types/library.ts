import { Book } from "./book";

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
