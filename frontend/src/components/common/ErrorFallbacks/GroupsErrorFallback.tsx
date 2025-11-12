import React from "react";
import { Users, RefreshCw } from "lucide-react";

interface GroupsErrorFallbackProps {
  error?: Error;
  retry?: () => void;
}

export const GroupsErrorFallback: React.FC<GroupsErrorFallbackProps> = ({ 
  error, 
  retry 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-6">
          <Users className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3 font-serif">
          Groups Error
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mb-6">
          We're having trouble loading your reading groups. Please try again.
        </p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error.message}
          </p>
        )}
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );
};
