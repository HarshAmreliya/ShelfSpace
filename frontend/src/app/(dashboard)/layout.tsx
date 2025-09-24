"use client";

import React, { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DashboardErrorFallback } from "@/components/common/ErrorFallbacks/DashboardErrorFallback";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
    console.log("Sign out clicked");
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Navigation */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
          <Navigation 
            onSignOut={handleSignOut} 
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>
        
        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-hidden ${
            isCollapsed 
              ? "ml-16 lg:ml-16" 
              : "ml-0 lg:ml-64 md:ml-56 sm:ml-48"
          }`}
        >
          {/* Mobile Header */}
          <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">ShelfSpace</h1>
            <div className="w-9 h-9" /> {/* Spacer for centering */}
          </div>
          
          <div className="h-full overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
