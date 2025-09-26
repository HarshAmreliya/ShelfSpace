"use client";

import React from "react";
import { Spinner } from "@/components/ui/Spinner";
import { PageSkeleton } from "./PageSkeleton";

// Generic loading spinner with message
export const LoadingSpinner: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ message = "Loading...", size = "md", className }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <Spinner size={size} className="mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
};

// Page loading overlay
export const PageLoadingOverlay: React.FC<{ message?: string }> = ({
  message = "Loading page...",
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

// Library loading skeleton
export const LibraryLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="library" />
);

// Dashboard loading skeleton
export const DashboardLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="dashboard" />
);

// Chat loading skeleton
export const ChatLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="chat" />
);

// Discover loading skeleton
export const DiscoverLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="discover" />
);

// Groups loading skeleton
export const GroupsLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="groups" />
);

// Settings loading skeleton
export const SettingsLoadingSkeleton: React.FC = () => (
  <PageSkeleton variant="settings" />
);
