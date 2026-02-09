import api from "./api";

export interface DashboardSummary {
  totalBooks: number;
  booksRead: number;
  currentlyReading: number;
  wantToRead: number;
  readingGoal: number;
  currentStreak: number;
  averageRating: number;
  totalPages: number;
  readingTime: number;
  favoriteGenre: string;
}

export interface ReadingAnalyticsResponse {
  readingTrends: Array<{ month: string; books: number; pages: number; hours: number }>;
  genreData: Array<{ name: string; value: number; color: string }>;
  monthlyData: Array<{ month: string; books: number; pages: number; hours: number }>;
  ratingData: Array<{ rating: string; count: number }>;
  stats: {
    totalBooksThisYear: number;
    averageBooksPerMonth: number;
    totalPagesRead: number;
    averageRating: number;
    readingTime: number;
    favoriteGenre: string;
    longestStreak: number;
    currentStreak: number;
  };
}

export interface ReadingGoalsResponse {
  goals: Array<{
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
    deadline?: string;
    category: string;
    isCompleted?: boolean;
  }>;
  chartData: Array<{ goal: string; current: number; target: number; unit: string }>;
  completionRate: number;
}

export interface ActivityTimelineResponse {
  activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get("/api/analytics/dashboard/summary");
  return response.data;
}

export async function getReadingAnalytics(): Promise<ReadingAnalyticsResponse> {
  const response = await api.get("/api/analytics/dashboard/reading-analytics");
  return response.data;
}

export async function getReadingGoals(): Promise<ReadingGoalsResponse> {
  const response = await api.get("/api/analytics/dashboard/reading-goals");
  return response.data;
}

export async function getActivityTimeline(): Promise<ActivityTimelineResponse> {
  const response = await api.get("/api/analytics/dashboard/activity");
  return response.data;
}
