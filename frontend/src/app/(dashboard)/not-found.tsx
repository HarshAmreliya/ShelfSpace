import Link from "next/link";
import {
  Home,
  BookOpen,
  Library,
  MessageSquare,
  Users,
  Compass,
  Settings,
} from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-dye-50/30 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl w-full mx-auto text-center">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-dye-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-indigo-dye-100 to-verdigris-100 dark:from-indigo-dye-900 dark:to-verdigris-900 p-8 rounded-full shadow-2xl">
              <BookOpen className="w-16 h-16 text-indigo-dye-600 dark:text-indigo-dye-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-10">
          <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-dye-600 to-verdigris-600 dark:from-indigo-dye-400 dark:to-verdigris-400 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This page doesn&apos;t exist in your dashboard. Let&apos;s navigate
            you somewhere useful.
          </p>
        </div>

        {/* Primary Action */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-dye-600 hover:bg-indigo-dye-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-dye-500/50"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Quick Navigation Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/library"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Library className="w-6 h-6 text-indigo-dye-600 dark:text-indigo-dye-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Library
              </span>
            </Link>

            <Link
              href="/discover"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Compass className="w-6 h-6 text-safety-orange-600 dark:text-safety-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Discover
              </span>
            </Link>

            <Link
              href="/chat"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <MessageSquare className="w-6 h-6 text-verdigris-600 dark:text-verdigris-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                AI Chat
              </span>
            </Link>

            <Link
              href="/groups"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Users className="w-6 h-6 text-peach-yellow-600 dark:text-peach-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Groups
              </span>
            </Link>

            <Link
              href="/settings"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Settings
              </span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-dye-50 dark:hover:bg-indigo-dye-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105 group"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Home className="w-6 h-6 text-turkey-red-600 dark:text-turkey-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Profile
              </span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Still can&apos;t find what you&apos;re looking for?{" "}
          <a
            href="#"
            className="text-indigo-dye-600 dark:text-indigo-dye-400 hover:underline font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
