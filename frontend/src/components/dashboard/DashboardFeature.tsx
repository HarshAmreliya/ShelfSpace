"use client";

import React from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DashboardErrorFallback } from "@/components/common/ErrorFallbacks/DashboardErrorFallback";
import {
  BookOpen, 
  BookMarked,
  Clock,
  Star,
  TrendingUp,
  Library,
  PenTool,
  Target
} from "lucide-react";

// Mock data for the book-themed dashboard
const mockReadingStats = {
  totalBooks: 247,
  booksRead: 189,
  currentlyReading: 3,
  wantToRead: 45,
  readingGoal: 200,
  currentStreak: 28,
  averageRating: 4.3,
  totalPages: 45670,
  readingTime: 342,
  favoriteGenre: "Fantasy",
  longestBook: "The Count of Monte Cristo",
  shortestBook: "The Old Man and the Sea"
};

const mockCurrentlyReading = [
  { 
    id: 1, 
    title: "The Seven Husbands of Evelyn Hugo", 
    author: "Taylor Jenkins Reid", 
    progress: 78, 
    rating: 4.6, 
    pages: 400,
    currentPage: 312,
    genre: "Historical Fiction",
    cover: "📖"
  },
  { 
    id: 2, 
    title: "Project Hail Mary", 
    author: "Andy Weir", 
    progress: 45, 
    rating: 4.8, 
    pages: 496,
    currentPage: 223,
    genre: "Science Fiction",
    cover: "🚀"
  },
  { 
    id: 3, 
    title: "Atomic Habits", 
    author: "James Clear", 
    progress: 92, 
    rating: 4.7, 
    pages: 320,
    currentPage: 294,
    genre: "Self-Help",
    cover: "⚛️"
  }
];

const mockRecentActivity = [
  { action: "Finished reading", book: "The Midnight Library", time: "2 hours ago", icon: "📚" },
  { action: "Added to wishlist", book: "Dune", time: "1 day ago", icon: "⭐" },
  { action: "Started reading", book: "Project Hail Mary", time: "3 days ago", icon: "🚀" },
  { action: "Rated 5 stars", book: "Atomic Habits", time: "1 week ago", icon: "⭐" },
  { action: "Joined book club", book: "Fantasy Readers", time: "2 weeks ago", icon: "👥" }
];

const mockReadingGoals = [
  { goal: "Books this year", current: 189, target: 200, unit: "books" },
  { goal: "Pages this month", current: 2840, target: 3000, unit: "pages" },
  { goal: "Reading streak", current: 28, target: 30, unit: "days" },
  { goal: "Average rating", current: 4.3, target: 4.5, unit: "stars" }
];

export interface DashboardFeatureProps {
  className?: string;
}

export function DashboardFeature({ className }: DashboardFeatureProps) {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative z-10 ${className || ""}`}>
        {/* Decorative book-themed background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-5 dark:opacity-10">📚</div>
          <div className="absolute top-40 right-20 text-4xl opacity-5 dark:opacity-10">📖</div>
          <div className="absolute bottom-20 left-1/4 text-5xl opacity-5 dark:opacity-10">📝</div>
          <div className="absolute bottom-40 right-1/3 text-3xl opacity-5 dark:opacity-10">✍️</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Literary Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 font-serif">
                  Your Reading Sanctuary
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-slate-300 italic">
                  "A room without books is like a body without a soul." - Cicero
                </p>
              </div>
            </div>
          </div>

          {/* Reading Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <BookStatCard
              title="Library Collection"
              value={mockReadingStats.totalBooks}
              subtitle="books owned"
              icon={Library}
              color="amber"
              accent="📚"
            />
            <BookStatCard
              title="Books Completed"
              value={mockReadingStats.booksRead}
              subtitle="books finished"
              icon={BookMarked}
              color="green"
              accent="✅"
            />
            <BookStatCard
              title="Currently Reading"
              value={mockReadingStats.currentlyReading}
              subtitle="active books"
              icon={BookOpen}
              color="blue"
              accent="📖"
            />
            <BookStatCard
              title="Reading Streak"
              value={`${mockReadingStats.currentStreak} days`}
              subtitle="consecutive days"
              icon={TrendingUp}
              color="purple"
              accent="🔥"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Currently Reading Books */}
            <div className="lg:col-span-2">
              <BookCard
                title="Currently Reading"
                subtitle="Your active literary journey"
                icon={BookOpen}
                accent="📚"
              >
                <div className="space-y-3 sm:space-y-4">
                  {mockCurrentlyReading.map((book) => (
                    <div key={book.id} className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="text-2xl sm:text-3xl flex-shrink-0">{book.cover}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 font-serif truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 italic truncate">
                            by {book.author}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                              {book.genre}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100">
                                {book.rating}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-1">
                              <span>Progress</span>
                              <span className="truncate ml-2">{book.currentPage}/{book.pages} pages</span>
                            </div>
                            <div className="bg-gray-200 dark:bg-slate-600 rounded-full h-2 sm:h-3">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                            <div className="text-right text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {book.progress}% complete
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BookCard>
            </div>

            {/* Reading Goals */}
            <div>
              <BookCard
                title="Reading Goals"
                subtitle="Your literary targets"
                icon={Target}
                accent="🎯"
              >
                <div className="space-y-4">
                  {mockReadingGoals.map((goal, index) => (
                    <div key={index} className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200 dark:border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {goal.goal}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-slate-300">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {Math.round((goal.current / goal.target) * 100)}% complete
                      </div>
                    </div>
                  ))}
                </div>
              </BookCard>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <RecentActivity activities={mockRecentActivity} />
            
            {/* Reading Insights */}
            <ReadingInsights stats={mockReadingStats} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Book-themed Stat Card Component
interface BookStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "amber" | "green" | "blue" | "purple";
  accent: string;
}

function BookStatCard({ title, value, subtitle, icon: Icon, color, accent }: BookStatCardProps) {
  const colorClasses = {
    amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    green: "bg-gradient-to-br from-green-400 to-emerald-500 text-white",
    blue: "bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
    purple: "bg-gradient-to-br from-purple-400 to-violet-500 text-white"
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-2xl opacity-60">{accent}</div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 font-serif">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-slate-300">
          {title}
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 italic">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

// Book-themed Card Component
interface BookCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  children: React.ReactNode;
}

function BookCard({ title, subtitle, icon: Icon, accent, children }: BookCardProps) {
  return (
    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 font-serif">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-300 italic">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl opacity-60">{accent}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

// Recent Activity Component
interface RecentActivityProps {
  activities: Array<{
    action: string;
    book: string;
    time: string;
    icon: string;
  }>;
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <BookCard
      title="Recent Activity"
      subtitle="Your latest literary adventures"
      icon={Clock}
      accent="📚"
    >
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50/50 dark:bg-slate-700/50 border border-amber-200 dark:border-slate-600">
            <div className="text-xl">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-slate-100">
                <span className="font-medium">{activity.action}</span>{" "}
                <span className="italic text-gray-600 dark:text-slate-300">"{activity.book}"</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </BookCard>
  );
}

// Reading Insights Component
interface ReadingInsightsProps {
  stats: typeof mockReadingStats;
}

function ReadingInsights({ stats }: ReadingInsightsProps) {
  const insights = [
    { label: "Total Pages Read", value: stats.totalPages.toLocaleString(), icon: "📄" },
    { label: "Reading Time", value: `${stats.readingTime} hours`, icon: "⏰" },
    { label: "Average Rating", value: `${stats.averageRating}/5`, icon: "⭐" },
    { label: "Favorite Genre", value: stats.favoriteGenre, icon: "🎭" },
    { label: "Longest Book", value: stats.longestBook, icon: "📖" },
    { label: "Shortest Book", value: stats.shortestBook, icon: "📝" }
  ];

  return (
    <BookCard
      title="Reading Insights"
      subtitle="Your literary statistics"
      icon={PenTool}
      accent="📊"
    >
      <div className="grid grid-cols-2 gap-3">
        {insights.map((insight, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-amber-50/50 dark:bg-slate-700/50 border border-amber-200 dark:border-slate-600">
            <div className="text-lg mb-1">{insight.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
              {insight.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-slate-300">
              {insight.label}
            </div>
          </div>
        ))}
      </div>
    </BookCard>
  );
}

export default DashboardFeature;
