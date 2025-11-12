"use client";

import Link from "next/link";
import { Home, ArrowLeft, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-dye-50 via-gray-50 to-verdigris-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-safety-orange-500 rounded-full opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-dye-500 rounded-full opacity-5 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-2xl w-full mx-auto text-center px-4 relative z-10">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-dye-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-xl border-4 border-indigo-dye-100 dark:border-indigo-dye-900">
              <BookOpen className="w-16 h-16 text-indigo-dye-600 dark:text-indigo-dye-400" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-dye-600 to-verdigris-600 dark:from-indigo-dye-400 dark:to-verdigris-400 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Looks like this page took a detour. Let&apos;s get you back on
            track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-dye-600 hover:bg-indigo-dye-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-dye-500/50"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Popular Pages
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/library"
              className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-indigo-dye-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              Library
            </Link>
            <Link
              href="/discover"
              className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-indigo-dye-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              Discover
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-indigo-dye-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              AI Chat
            </Link>
            <Link
              href="/groups"
              className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-indigo-dye-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              Groups
            </Link>
            <Link
              href="/settings"
              className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-indigo-dye-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Need help? Contact our{" "}
          <a
            href="#"
            className="text-indigo-dye-600 dark:text-indigo-dye-400 hover:underline font-medium"
          >
            support team
          </a>
        </p>
      </div>
    </div>
  );
}
