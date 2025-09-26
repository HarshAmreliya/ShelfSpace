import Link from "next/link";
import { Home, BookOpen } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-indigo-dye-100 dark:bg-indigo-dye-900 rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-indigo-dye-600 dark:text-indigo-dye-400" />
          </div>
          <h1 className="text-6xl font-bold text-indigo-dye-600 dark:text-indigo-dye-400 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Dashboard Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The dashboard page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-dye-600 hover:bg-indigo-dye-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-dye-500 focus:ring-opacity-50"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition duration-300"
            >
              Library
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition duration-300"
            >
              Chat
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition duration-300"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? Check our navigation menu or contact support.</p>
        </div>
      </div>
    </div>
  );
}
