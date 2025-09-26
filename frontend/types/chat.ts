import { BaseEntity, ID, Timestamp } from "./common";
import { Book } from "./book";

// Message types
export type MessageType = "user" | "ai" | "system";

export type MessageStatus = "sending" | "sent" | "delivered" | "error";

// Main message interface
export interface Message extends BaseEntity {
  type: MessageType;
  content: string;
  status: MessageStatus;
  conversationId: ID;
  userId?: ID;

  // AI-specific fields
  suggestions?: string[];
  bookRecommendations?: Book[];
  actions?: MessageAction[];

  // Metadata
  metadata?: Record<string, any>;
  isEdited: boolean;
  editedAt?: Timestamp;
  parentMessageId?: ID; // For threaded conversations
}

// Message actions (buttons/quick actions)
export interface MessageAction {
  id: string;
  label: string;
  type: "button" | "link" | "quick-reply";
  action: string;
  data?: Record<string, any>;
  variant?: "primary" | "secondary" | "outline";
}

// Conversation interface
export interface Conversation extends BaseEntity {
  title?: string;
  userId: ID;
  messageCount: number;
  lastMessageAt: Timestamp;
  isArchived: boolean;
  isPinned: boolean;
  tags: string[];

  // AI context
  context?: ConversationContext;

  // Messages (populated when needed)
  messages?: Message[];
}

// Conversation context for AI
export interface ConversationContext {
  userPreferences?: {
    favoriteGenres: string[];
    readingGoals: Record<string, number>;
    currentlyReading: Book[];
  };
  recentBooks?: Book[];
  libraryStats?: {
    totalBooks: number;
    averageRating: number;
    topGenres: string[];
  };
  conversationHistory?: {
    topics: string[];
    preferences: Record<string, any>;
  };
}

// Chat state interface
export interface ChatState {
  // Current conversation
  currentConversation: Conversation | null;
  messages: Message[];

  // All conversations
  conversations: Conversation[];

  // UI state
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;

  // Input state
  inputValue: string;
  isComposing: boolean;

  // Sidebar state
  showSidebar: boolean;
  searchQuery: string;
  filteredConversations: Conversation[];
}

// Chat actions interface
export interface ChatActions {
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: ID, content: string) => Promise<void>;
  deleteMessage: (messageId: ID) => Promise<void>;
  resendMessage: (messageId: ID) => Promise<void>;

  // Conversation actions
  createConversation: (title?: string) => Promise<Conversation>;
  updateConversation: (id: ID, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: ID) => Promise<void>;
  archiveConversation: (id: ID) => Promise<void>;
  pinConversation: (id: ID) => Promise<void>;

  // Navigation actions
  selectConversation: (id: ID) => Promise<void>;
  clearCurrentConversation: () => void;

  // UI actions
  setInputValue: (value: string) => void;
  setIsComposing: (isComposing: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;

  // Quick actions
  askForRecommendations: (preferences?: string) => Promise<void>;
  askAboutBook: (bookId: ID) => Promise<void>;
  getReadingStats: () => Promise<void>;

  // Data refresh
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

// Chat context value
export interface ChatContextValue {
  state: ChatState;
  actions: ChatActions;
}

// AI assistant capabilities
export interface AICapability {
  id: string;
  name: string;
  description: string;
  category:
    | "recommendations"
    | "analysis"
    | "discovery"
    | "organization"
    | "social";
  examples: string[];
  isEnabled: boolean;
}

// Quick action templates
export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  category: string;
  icon?: string;
  requiresContext?: boolean;
}

// Typing indicator interface
export interface TypingIndicator {
  conversationId: ID;
  isTyping: boolean;
  startedAt: Timestamp;
}

// Message search interface
export interface MessageSearchFilter {
  query?: string;
  conversationId?: ID;
  messageType?: MessageType;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  hasRecommendations?: boolean;
  hasActions?: boolean;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  matchScore: number;
  highlights: string[];
}
