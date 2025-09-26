"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DiscoverErrorFallback } from "@/components/common/ErrorFallbacks/DiscoverErrorFallback";
import { useReadingLists } from "@/hooks/data/useReadingLists";
import { BookCard } from "@/components/common/BookCard/BookCard";
import { BookListItem } from "@/components/library/components/BookListItem";
import { cn } from "@/utils/cn";
import { PageSkeleton } from "@/components/common/LoadingStates/PageSkeleton";
import { Book } from "@/types/book";
import { ReadingList } from "@/types/library";
import {
  BookOpen,
  Search,
  Star,
  Clock,
  Grid,
  List,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react";

type ViewMode = "grid" | "list";
type SortBy = "title" | "author" | "rating" | "publishedYear";
type SortOrder = "asc" | "desc";

export function DiscoverFeature() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(true);
  const { data: readingLists, isLoading: isLoadingReadingLists } = useReadingLists({ includeBooks: true });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const allBooks = useMemo((): Book[] => {
    if (isLoadingReadingLists || !readingLists) return [];
    const books = readingLists.flatMap((list: ReadingList) => list.books || []);
    // Ensure unique books if a book can be in multiple lists
    const uniqueBooks = Array.from(new Map(books.map((book: Book) => [book.id, book])).values()) as Book[];
    return uniqueBooks;
  }, [readingLists, isLoadingReadingLists]);

  const genres = useMemo(() => {
    const uniqueGenres = new Set(allBooks.flatMap((book: Book) => book.genres || []));
    return Array.from(uniqueGenres).sort();
  }, [allBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = allBooks.filter((book: Book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedGenre) {
      filtered = filtered.filter((book: Book) => book.genres.includes(selectedGenre));
    }

    filtered.sort((a: Book, b: Book) => {
      let compareA: any;
      let compareB: any;

      switch (sortBy) {
        case "title":
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case "author":
          compareA = a.author.toLowerCase();
          compareB = b.author.toLowerCase();
          break;
        case "rating":
          compareA = a.rating || 0;
          compareB = b.rating || 0;
          break;
        case "publishedYear":
          compareA = a.publishedYear || 0;
          compareB = b.publishedYear || 0;
          break;
        default:
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allBooks, searchQuery, selectedGenre, sortBy, sortOrder]);

  const trendingBooks = useMemo(() => {
    return allBooks
      .filter((book: Book) => (book.averageRating || 0) >= 4.0)
      .sort((a: Book, b: Book) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5); // Top 5 trending
  }, [allBooks]);

  const recentlyAddedBooks = useMemo(() => {
    return allBooks
      .sort((a: Book, b: Book) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 5); // 5 most recently added
  }, [allBooks]);

  if (isLoading || isLoadingReadingLists) {
    return <PageSkeleton variant="discover" />;
  }

  return (
    <ErrorBoundary fallback={DiscoverErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative z-10">
        {/* Decorative book-themed background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-5 dark:opacity-10">📚</div>
          <div className="absolute top-40 right-20 text-4xl opacity-5 dark:opacity-10">📖</div>
          <div className="absolute bottom-20 left-1/4 text-5xl opacity-5 dark:opacity-10">📝</div>
          <div className="absolute bottom-40 right-1/3 text-3xl opacity-5 dark:opacity-10">✍️</div>
        </div>

        <div className="relative container mx-auto px-4 py-8 z-20">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 font-serif text-center">
            Discover Books
          </h1>
          <p className="text-xl text-gray-700 dark:text-slate-300 mb-10 text-center max-w-2xl mx-auto">
            Explore new worlds, find your next favorite read, and connect with stories that move you.
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <label htmlFor="book-search" className="sr-only">Search books</label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
              <input
                id="book-search"
                name="book-search"
                type="text"
                placeholder="Search books, authors, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Genre Filter */}
            <div className="lg:w-48">
              <label htmlFor="genre-filter" className="sr-only">Filter by genre</label>
              <select
                id="genre-filter"
                name="genre-filter"
                value={selectedGenre || ""}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
                className="w-full px-4 py-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <label htmlFor="sort-by" className="sr-only">Sort books</label>
              <select
                id="sort-by"
                name="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="rating">Sort by Rating</option>
                <option value="publishedYear">Sort by Year</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 transition-colors flex items-center justify-center shadow-sm"
              aria-label={`Sort order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? (
                <ArrowUpNarrowWide className="h-5 w-5" />
              ) : (
                <ArrowDownNarrowWide className="h-5 w-5" />
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors shadow-sm",
                  viewMode === "grid" ? "bg-amber-100 dark:bg-slate-600 text-amber-700 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"
                )}
                aria-label="View as grid"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-3 border border-amber-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors shadow-sm",
                  viewMode === "list" ? "bg-amber-100 dark:bg-slate-600 text-amber-700 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"
                )}
                aria-label="View as list"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Trending Books Section */}
          {trendingBooks.length > 0 && (
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-6 flex items-center">
                <Star className="h-7 w-7 text-yellow-500 mr-3 fill-current" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {trendingBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Added Books Section */}
          {recentlyAddedBooks.length > 0 && (
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-6 flex items-center">
                <Clock className="h-7 w-7 text-blue-500 mr-3" />
                Recently Added
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {recentlyAddedBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* All Books Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-6 flex items-center">
              <BookOpen className="h-7 w-7 text-amber-600 mr-3" />
              All Books ({filteredAndSortedBooks.length})
            </h2>
            {filteredAndSortedBooks.length === 0 ? (
              <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-amber-200 dark:border-slate-700">
                <p className="text-gray-600 dark:text-slate-400 text-lg">
                  No books found matching your criteria. Try adjusting your search or filters.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAndSortedBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedBooks.map(book => (
                  <BookListItem key={book.id} book={book} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
}
