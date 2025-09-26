"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReadingList } from "@/types/library";
import { ReadingListItem } from "@/components/library/components/ReadingListItem";
import { SearchInput } from "@/components/library/components/SearchInput";

interface LibrarySidebarProps {
  readingLists: ReadingList[];
  selectedList: string;
  setSelectedList: (listId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  readingLists,
  selectedList,
  setSelectedList,
  searchQuery,
  setSearchQuery,
}) => {
  const handleAddBook = () => {
    // TODO: Implement add book functionality
    console.log("Add book clicked");
  };

  const handleAddBookKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAddBook();
    }
  };

  return (
    <div className="w-80 bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-r border-amber-200 dark:border-slate-700 flex flex-col shadow-lg">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-amber-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={handleAddBook}
            onKeyDown={handleAddBookKeyDown}
            variant="primary"
            size="md"
            leftIcon={Plus}
            aria-label="Add new book to library"
          >
            Add Book
          </Button>
        </div>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search books..."
        />
      </div>

      {/* Reading Lists */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2
          className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide"
          id="reading-lists-heading"
        >
          Reading Lists
        </h2>
        <div
          className="space-y-2"
          role="list"
          aria-labelledby="reading-lists-heading"
        >
          {readingLists.map((list) => (
            <div key={list.id} role="listitem">
              <ReadingListItem
                list={list}
                isSelected={selectedList === list.id}
                onSelect={setSelectedList}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibrarySidebar;
