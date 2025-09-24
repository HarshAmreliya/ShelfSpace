"use client";

import React from "react";
import { ReadingList, ViewMode } from "@/types/library";
import { ViewModeToggle } from "@/components/library/components/ViewModeToggle";
import { FilterControls } from "@/components/library/components/FilterControls";

interface LibraryHeaderProps {
  currentList: ReadingList | undefined;
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
  filterGenre: string;
  setFilterGenre: (genre: string) => void;
  sortBy: "title" | "author" | "dateAdded" | "rating";
  setSortBy: (sort: "title" | "author" | "dateAdded" | "rating") => void;
  genres: string[];
  filteredBooksCount: number;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  currentList,
  viewMode,
  setViewMode,
  filterGenre,
  setFilterGenre,
  sortBy,
  setSortBy,
  genres,
  filteredBooksCount,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif"
            id="library-title"
          >
            {currentList?.name || "Library"}
          </h1>
          {currentList?.description && (
            <p
              className="text-gray-600 dark:text-slate-300 italic"
              aria-describedby="library-title"
            >
              {currentList.description}
            </p>
          )}
        </div>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Filters */}
      <div role="region" aria-label="Filter and sort controls">
        <FilterControls
          filterGenre={filterGenre}
          onFilterGenreChange={setFilterGenre}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          genres={genres}
          filteredBooksCount={filteredBooksCount}
        />
      </div>
    </div>
  );
};

export default LibraryHeader;
