import { ReadingList } from "@/types/library";

/**
 * Mock reading lists for development and testing
 */
export const mockReadingLists: ReadingList[] = [
  {
    id: "1",
    name: "Currently Reading",
    description: "Books I'm currently reading",
    bookIds: ["3", "6"],
    bookCount: 2,
    isDefault: true,
    isPublic: false,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-02-01T13:00:00Z",
    userId: "user-1",
    books: [], // Will be populated by the service
  },
  {
    id: "2",
    name: "Want to Read",
    description: "Books I want to read in the future",
    bookIds: ["4", "7", "8"],
    bookCount: 3,
    isDefault: true,
    isPublic: false,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-02-02T10:00:00Z",
    userId: "user-1",
    books: [], // Will be populated by the service
  },
  {
    id: "3",
    name: "Read",
    description: "Books I've finished reading",
    bookIds: ["1", "2", "5", "9", "10"],
    bookCount: 5,
    isDefault: true,
    isPublic: false,
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-28T18:00:00Z",
    userId: "user-1",
    books: [], // Will be populated by the service
  },
  {
    id: "4",
    name: "Classic Literature",
    description: "My collection of classic literature",
    bookIds: ["1", "2", "4", "5"],
    bookCount: 4,
    isDefault: false,
    isPublic: true,
    sortOrder: 4,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-30T11:00:00Z",
    userId: "user-1",
    books: [], // Will be populated by the service
  },
  {
    id: "5",
    name: "Fantasy & Sci-Fi",
    description: "Fantasy and science fiction books",
    bookIds: ["6", "7", "8"],
    bookCount: 3,
    isDefault: false,
    isPublic: true,
    sortOrder: 5,
    createdAt: "2024-02-01T13:00:00Z",
    updatedAt: "2024-02-02T10:00:00Z",
    userId: "user-1",
    books: [], // Will be populated by the service
  },
];
