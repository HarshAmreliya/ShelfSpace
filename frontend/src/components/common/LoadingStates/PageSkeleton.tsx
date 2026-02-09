"use client";

import React from "react";

interface PageSkeletonProps {
  variant: "library" | "dashboard" | "chat" | "discover" | "groups" | "forums" | "settings";
}

const titles: Record<PageSkeletonProps["variant"], string> = {
  library: "Loading Library",
  dashboard: "Loading Dashboard",
  chat: "Loading Chat",
  discover: "Loading Discover",
  groups: "Loading Forums",
  forums: "Loading Forums",
  settings: "Loading Settings",
};

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6 animate-pulse" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-10 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="sr-only">{titles[variant]}</div>
      </div>
    </div>
  );
};
