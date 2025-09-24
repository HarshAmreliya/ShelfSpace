"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, className = "" }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onSelect) {
      onSelect(book);
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "read":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "currently-reading":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "want-to-read":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <article
      className={`
        bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-slate-700
        shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-orange-200 dark:from-slate-700 dark:to-slate-600 rounded-t-lg flex items-center justify-center">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="text-amber-600 dark:text-slate-400 text-4xl font-serif">
            📚
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm line-clamp-2 mb-1">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-gray-600 dark:text-slate-400 text-xs mb-3 line-clamp-1">
          by {book.author}
        </p>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${getStatusColor(book.status)}
            `}
          >
            {book.status.replace("-", " ")}
          </span>
          {book.rating && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              ⭐ {book.rating}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {book.status === "currently-reading" && (
          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mb-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}

        {/* Genres */}
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-xs bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-slate-300 px-2 py-1 rounded"
              >
                {genre}
              </span>
            ))}
            {book.genres.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                +{book.genres.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};