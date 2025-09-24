import { BaseEntity, ID, Timestamp, ViewMode, SortOrder } from "./common";
import { Book, BookFilter } from "./book";
import { LucideIcon } from "lucide-react";

// Reading list interface
export interface ReadingList extends BaseEntity {
  name: string;
  description?: string;
  color: string;
  icon: LucideIcon;
  isDefault: boolean;
  isPublic: boolean;
  userId: ID;
  bookIds: ID[];
  books?: Book[]; // Populated when needed
  bookCount: number;
  sortOrder: number;
}

// Reading list creation/update payload
export interface ReadingListInput {
  name: string;
  description?: string;
  color?: string;
  icon?: LucideIcon;
  isPublic?: boolean;
  bookIds?: ID[];
}

// Library view configuration
export interface LibraryViewConfig {
  viewMode: ViewMode;
  sortBy: "title" | "author" | "dateAdded" | "lastRead" | "rating" | "progress";
  sortOrder: SortOrder;
  groupBy?: "none" | "status" | "genre" | "author" | "rating";
  showProgress: boolean;
  showRating: boolean;
  showNotes: boolean;
  itemsPerPage: number;
}

// Library filters extending book filters
export interface LibraryFilter extends BookFilter {
  listId?: ID;
  showOnlyFavorites?: boolean;
  showOnlyWithNotes?: boolean;
  progressRange?: {
    min: number;
    max: number;
  };
}

// Library statistics
export interface LibraryStats {
  totalBooks: number;
  totalPages: number;
  totalLists: number;
  booksByStatus: Record<string, number>;
  booksByGenre: Record<string, number>;
  booksByFormat: Record<string, number>;
  averageRating: number;
  readingProgress: {
    booksInProgress: number;
    totalProgressPages: number;
    averageProgress: number;
  };
  readingGoals: {
    daily: { target: number; current: number };
    weekly: { target: number; current: number };
    monthly: { target: number; current: number };
    yearly: { target: number; current: number };
  };
}

// Library state interface for state management
export interface LibraryState {
  // Data
  books: Book[];
  readingLists: ReadingList[];
  selectedListId: ID | null;

  // UI State
  viewConfig: LibraryViewConfig;
  filters: LibraryFilter;
  searchQuery: string;

  // Async states
  isLoading: boolean;
  isLoadingBooks: boolean;
  isLoadingLists: boolean;
  error: string | null;

  // Selection and editing
  selectedBooks: ID[];
  editingList: ReadingList | null;
  showCreateListModal: boolean;
  showEditListModal: boolean;
  showDeleteConfirmModal: boolean;
}

// Library actions interface
export interface LibraryActions {
  // Book actions
  addBook: (book: Book) => Promise<void>;
  updateBook: (id: ID, updates: Partial<Book>) => Promise<void>;
  removeBook: (id: ID) => Promise<void>;
  moveBooks: (bookIds: ID[], targetListId: ID) => Promise<void>;

  // List actions
  createList: (list: ReadingListInput) => Promise<void>;
  updateList: (id: ID, updates: Partial<ReadingListInput>) => Promise<void>;
  deleteList: (id: ID) => Promise<void>;
  reorderLists: (listIds: ID[]) => Promise<void>;

  // Selection actions
  selectList: (listId: ID | null) => void;
  selectBooks: (bookIds: ID[]) => void;
  clearSelection: () => void;

  // Filter and view actions
  updateFilters: (filters: Partial<LibraryFilter>) => void;
  updateViewConfig: (config: Partial<LibraryViewConfig>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Modal actions
  showCreateList: () => void;
  showEditList: (list: ReadingList) => void;
  showDeleteConfirm: (list: ReadingList) => void;
  hideModals: () => void;

  // Data refresh
  refreshBooks: () => Promise<void>;
  refreshLists: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Library context value
export interface LibraryContextValue {
  state: LibraryState;
  actions: LibraryActions;
}

// Book import/export interfaces
export interface BookImportData {
  books: Partial<Book>[];
  lists?: Partial<ReadingListInput>[];
  format: "csv" | "json" | "goodreads" | "librarything";
}

export interface BookExportOptions {
  includePersonalData: boolean;
  includeNotes: boolean;
  includeProgress: boolean;
  format: "csv" | "json" | "pdf";
  listIds?: ID[];
}

// Reading session interface
export interface ReadingSession extends BaseEntity {
  bookId: ID;
  userId: ID;
  startTime: Timestamp;
  endTime?: Timestamp;
  pagesRead: number;
  duration: number; // in minutes
  notes?: string;
  location?: string; // where they were reading
}
