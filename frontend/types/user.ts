import { BaseEntity, ID, Timestamp, Theme } from "./common";
import { Genre } from "./book";

// User role enum
export type UserRole = "user" | "moderator" | "admin";

// User status enum
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

// Main User interface
export interface User extends BaseEntity {
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt?: Timestamp;

  // Reading preferences
  favoriteGenres: Genre[];
  readingGoals: ReadingGoals;

  // Privacy settings
  isProfilePublic: boolean;
  isLibraryPublic: boolean;
  allowRecommendations: boolean;

  // Social features
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean; // Only present when viewing another user's profile
}

// User profile update payload
export interface UserProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  favoriteGenres?: Genre[];
  isProfilePublic?: boolean;
  isLibraryPublic?: boolean;
  allowRecommendations?: boolean;
}

// Reading goals interface
export interface ReadingGoals {
  daily?: number;
  weekly?: number;
  monthly?: number;
  yearly?: number;
}

// User preferences interface
export interface UserPreferences {
  theme: Theme;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";

  // Reading preferences
  defaultBookFormat: "physical" | "ebook" | "audiobook";
  autoMarkAsRead: boolean;
  showReadingProgress: boolean;
  readingReminders: boolean;

  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookRecommendations: boolean;
  groupUpdates: boolean;
  reviewReminders: boolean;
  readingChallenges: boolean;
  newFollowers: boolean;
  bookReleases: boolean;

  // Privacy preferences
  shareReadingStats: boolean;
  dataSyncEnabled: boolean;
  analyticsEnabled: boolean;
}

// User activity interface
export interface UserActivity extends BaseEntity {
  userId: ID;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  isPublic: boolean;
}

// Activity types
export type ActivityType =
  | "book-added"
  | "book-started"
  | "book-finished"
  | "book-rated"
  | "book-reviewed"
  | "list-created"
  | "list-updated"
  | "group-joined"
  | "group-left"
  | "user-followed"
  | "goal-achieved"
  | "milestone-reached";

// User statistics
export interface UserStats {
  booksRead: number;
  pagesRead: number;
  readingStreak: number;
  averageRating: number;
  reviewsWritten: number;
  listsCreated: number;
  groupsJoined: number;
  followersCount: number;
  followingCount: number;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface AuthUser {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Timestamp;
}

// Password reset interfaces
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}
