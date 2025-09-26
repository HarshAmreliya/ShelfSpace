"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Book,
  Recommendation,
  ReadingGroup,
  Activity,
} from "../../../types/models";

// Mock data - in a real app, this would come from an API
const mockCurrentlyReading: Book[] = [
  {
    id: "1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    cover: "/book-covers/design-of-everyday-things.jpg",
    rating: 4.5,
    readingProgress: 65,
    status: "reading",
    dateAdded: "2024-01-15",
    lastRead: "2024-01-20",
    pages: 368,
    genre: "Design",
    tags: ["UX", "Psychology"],
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/book-covers/atomic-habits.jpg",
    rating: 4.8,
    readingProgress: 30,
    status: "reading",
    dateAdded: "2024-01-10",
    lastRead: "2024-01-19",
    pages: 320,
    genre: "Self-Help",
    tags: ["Productivity", "Habits"],
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    book: {
      id: "3",
      title: "Deep Work",
      author: "Cal Newport",
      cover: "/book-covers/deep-work.jpg",
      rating: 4.6,
      status: "want-to-read",
      dateAdded: "2024-01-20",
      pages: 296,
      genre: "Productivity",
    },
    reason: "Based on your interest in productivity and focus",
    confidence: 0.92,
  },
];

const mockReadingGroups: ReadingGroup[] = [
  {
    id: "1",
    name: "Design Thinkers",
    description: "Exploring design principles and user experience",
    memberCount: 24,
    currentBook: "The Design of Everyday Things",
    nextMeeting: "2024-01-25",
    isActive: true,
  },
];

const mockRecentActivity: Activity[] = [
  {
    id: "1",
    type: "reading_progress",
    description: 'Updated reading progress for "Atomic Habits"',
    timestamp: "2024-01-20T10:30:00Z",
    bookId: "2",
  },
  {
    id: "2",
    type: "book_added",
    description: 'Added "Deep Work" to Want to Read list',
    timestamp: "2024-01-19T15:45:00Z",
    bookId: "3",
  },
];

const mockStats = {
  totalBooks: 47,
  readingTime: 23,
  readingGoal: 85,
  activeGroups: 3,
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key);
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
  });
}

export function useDashboardData() {
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readingGroups, setReadingGroups] = useState<ReadingGroup[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);

    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedCurrentlyReading =
          getCachedData<Book[]>("currentlyReading");
        const cachedRecommendations =
          getCachedData<Recommendation[]>("recommendations");
        const cachedReadingGroups =
          getCachedData<ReadingGroup[]>("readingGroups");
        const cachedRecentActivity =
          getCachedData<Activity[]>("recentActivity");
        const cachedStats = getCachedData<typeof mockStats>("stats");

        if (
          cachedCurrentlyReading &&
          cachedRecommendations &&
          cachedReadingGroups &&
          cachedRecentActivity &&
          cachedStats
        ) {
          setCurrentlyReading(cachedCurrentlyReading);
          setRecommendations(cachedRecommendations);
          setReadingGroups(cachedReadingGroups);
          setRecentActivity(cachedRecentActivity);
          setStats(cachedStats);
          setIsLoading(false);
          return;
        }
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if request was aborted
      if (signal.aborted) {
        return;
      }

      // Cache the data
      setCachedData("currentlyReading", mockCurrentlyReading);
      setCachedData("recommendations", mockRecommendations);
      setCachedData("readingGroups", mockReadingGroups);
      setCachedData("recentActivity", mockRecentActivity);
      setCachedData("stats", mockStats);

      setCurrentlyReading(mockCurrentlyReading);
      setRecommendations(mockRecommendations);
      setReadingGroups(mockReadingGroups);
      setRecentActivity(mockRecentActivity);
      setStats(mockStats);
      setLastFetch(Date.now());
      setIsLoading(false);
    } catch (error) {
      if (!signal.aborted) {
        console.error("Failed to fetch dashboard data:", error);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once on mount

  const refetch = useCallback(
    (forceRefresh = false) => {
      return fetchData(forceRefresh);
    },
    [fetchData]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-refresh functionality
  const enableAutoRefresh = useCallback(
    (intervalMinutes: number) => {
      const interval = setInterval(() => {
        fetchData(false); // Use cache if available
      }, intervalMinutes * 60 * 1000);

      return () => clearInterval(interval);
    },
    [fetchData]
  );

  return {
    currentlyReading,
    recommendations,
    readingGroups,
    recentActivity,
    stats,
    isLoading,
    lastFetch,
    refetch,
    enableAutoRefresh,
    clearCache: () => cache.clear(),
  };
}
