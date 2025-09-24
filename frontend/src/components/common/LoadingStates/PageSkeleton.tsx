"use client";

import React from "react";

interface PageSkeletonProps {
  variant: "library" | "dashboard" | "chat" | "discover" | "groups" | "settings";
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant }) => {
  const renderLibrarySkeleton = () => (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Sidebar Skeleton */}
      <div className="w-80 bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
        </div>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/95 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/90 dark:bg-slate-800/95 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/90 dark:bg-slate-800/95 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChatSkeleton = () => (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  );

  const renderGroupsSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8 animate-pulse" />
        
        {/* Search and filters skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-48 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-48 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Popular groups skeleton */}
        <div className="mb-10">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/95 rounded-xl border border-amber-200 dark:border-slate-700 p-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4 animate-pulse" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse" />
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* All groups skeleton */}
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/90 dark:bg-slate-800/95 rounded-xl border border-amber-200 dark:border-slate-700 p-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4 animate-pulse" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse" />
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case "library":
      return renderLibrarySkeleton();
    case "dashboard":
      return renderDashboardSkeleton();
    case "chat":
      return renderChatSkeleton();
    case "groups":
      return renderGroupsSkeleton();
    default:
      return renderLibrarySkeleton();
  }
};