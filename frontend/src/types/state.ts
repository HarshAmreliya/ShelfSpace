export interface LibraryState {
  selectedList: string;
  viewMode: "grid" | "list";
  filters: {
    search: string;
    genre: string | null;
    status: string | null;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  selectedBooks: string[];
  isLoading: boolean;
  error: Error | null;
}

export interface LibraryActions {
  setSelectedList: (listId: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  updateFilters: (filters: Partial<LibraryState["filters"]>) => void;
  toggleBookSelection: (bookId: string) => void;
  clearSelection: () => void;
  resetFilters: () => void;
}

export interface DashboardState {
  refreshInterval: number;
  preferences: {
    showStats: boolean;
    showRecentActivity: boolean;
    showRecommendations: boolean;
    compactView: boolean;
  };
}

export interface ChatState {
  chatMode: "general" | "recommendations" | "discussion";
  messages: any[];
  inputMessage: string;
}

export interface NavigationState {
  activeTab: string;
  isCollapsed: boolean;
  preferences: {
    showLabels: boolean;
    compactMode: boolean;
  };
}

export interface AppState {
  user: any | null;
  theme: "light" | "dark" | "system";
  isAuthenticated: boolean;
  globalPreferences: {
    notifications: boolean;
    autoSave: boolean;
    language: string;
  };
  isLoading: boolean;
  error: string | null;
}

export interface AppActions {
  setTheme: (theme: AppState["theme"]) => void;
  updateGlobalPreferences: (
    preferences: Partial<AppState["globalPreferences"]>
  ) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}
