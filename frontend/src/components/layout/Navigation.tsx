"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useState,
} from "react";
import Link from "next/link";
// NavigationProps interface defined inline
interface NavigationProps {
  className?: string;
  onSignOut?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
import { useNavigation } from "@/hooks/navigation/useNavigation";
import {
  useKeyboardNavigation,
  commonShortcuts,
} from "@/hooks/useKeyboardNavigation";
import { preloadNavigationIcons } from "@/utils/lazyIcons";
import KeyboardShortcutsHelp from "@/components/common/KeyboardShortcutsHelp";
import { 
  BookOpen, 
  Library, 
  Search, 
  Users, 
  MessageCircle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation: React.FC<NavigationProps> = memo(
  ({ className = "", onSignOut, isCollapsed = false, onToggleCollapse }) => {
    const { actions, isActive, getNavigationItems } =
      useNavigation();
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const { actualTheme, toggleTheme } = useTheme();

    // Preload icons on mount
    useEffect(() => {
      preloadNavigationIcons();
    }, []);

    const navigationItems = useMemo(
      () => getNavigationItems(),
      [getNavigationItems]
    );

    const handleToggleCollapse = useCallback(() => {
      onToggleCollapse?.();
    }, [onToggleCollapse]);

    // Define keyboard shortcuts for navigation
    const keyboardShortcuts = useMemo(
      () => [
        commonShortcuts.help(() => setShowKeyboardHelp(true)),
        {
          key: "b",
          altKey: true,
          action: handleToggleCollapse,
          description: "Toggle sidebar",
        },
        {
          key: "t",
          altKey: true,
          action: toggleTheme,
          description: "Toggle theme",
        },
        {
          key: "1",
          altKey: true,
          action: () => navigationItems[0] && actions.navigateToItem(navigationItems[0]),
          description: "Go to Dashboard",
        },
        {
          key: "2",
          altKey: true,
          action: () => navigationItems[1] && actions.navigateToItem(navigationItems[1]),
          description: "Go to Library",
        },
        {
          key: "3",
          altKey: true,
          action: () => navigationItems[2] && actions.navigateToItem(navigationItems[2]),
          description: "Go to Discover",
        },
        {
          key: "4",
          altKey: true,
          action: () => navigationItems[3] && actions.navigateToItem(navigationItems[3]),
          description: "Go to Groups",
        },
        {
          key: "5",
          altKey: true,
          action: () => navigationItems[4] && actions.navigateToItem(navigationItems[4]),
          description: "Go to Chat",
        },
      ],
      [handleToggleCollapse, toggleTheme, actions, navigationItems]
    );

    // Set up keyboard navigation
    useKeyboardNavigation({
      shortcuts: keyboardShortcuts,
      enableArrowNavigation: true,
    });

    const handleItemClick = useCallback(
      (item: any) => {
        actions.navigateToItem(item);
      },
      [actions]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        actions.handleKeyboardNavigation(event.nativeEvent, navigationItems);
      },
      [actions, navigationItems]
    );

    const navigationClassName = useMemo(
      () =>
        `fixed left-0 top-0 ${
          isCollapsed 
            ? "w-16 lg:w-16" 
            : "w-64 lg:w-64 md:w-56 sm:w-48"
        } h-screen ${
          actualTheme === "dark" 
            ? "bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 border-slate-700" 
            : "bg-gradient-to-b from-amber-900 via-orange-900 to-red-900 border-amber-800"
        } text-white border-r z-40 flex flex-col transition-all duration-300 ease-in-out shadow-2xl overflow-hidden ${
          isCollapsed ? "hover:shadow-amber-500/20" : ""
        } ${className}`,
      [isCollapsed, actualTheme, className]
    );

    const contentClassName = useMemo(
      () => `space-y-2 ${isCollapsed ? "px-2" : "px-3"}`,
      [isCollapsed]
    );

    return (
      <>
        <nav
          id="navigation"
          className={navigationClassName}
          role="navigation"
          aria-label="Main navigation"
          onKeyDown={handleKeyDown}
        >
          {/* Book-themed Header */}
          <header 
            className={`flex items-center justify-between p-3 sm:p-4 border-b ${
              actualTheme === "dark" ? "border-slate-700/50" : "border-amber-800/50"
            } flex-shrink-0 cursor-pointer ${
              actualTheme === "dark" ? "hover:bg-slate-800/20" : "hover:bg-amber-800/20"
            } transition-colors duration-200`}
            role="banner"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-semibold text-white font-serif truncate">ShelfSpace</h1>
                  <p className="text-xs text-amber-200 italic hidden sm:block">Your Reading Sanctuary</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {!isCollapsed && (
                <div className="text-xs text-amber-300 opacity-70 hidden md:block">
                  Click to collapse
                </div>
              )}
              <div className="relative">
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-amber-200 transition-all duration-200" />
                ) : (
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-amber-200 transition-all duration-200" />
                )}
                <div className="absolute -top-1 -right-1 text-xs">
                  {isCollapsed ? "📖" : "📚"}
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Items */}
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6 h-[calc(100vh-140px)] cursor-pointer ${
              actualTheme === "dark" ? "hover:bg-slate-800/10" : "hover:bg-amber-800/10"
            } transition-colors duration-200`}
            role="menu"
            aria-label="Navigation menu"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className={`${contentClassName} w-full`}>
              <Suspense
                fallback={
                  <div className="animate-pulse h-8 bg-amber-800/30 rounded mx-2 mb-2" />
                }
              >
                {navigationItems.map((item, index) => (
                  <div key={item.name} onClick={(e) => e.stopPropagation()}>
                    <BookNavigationItem
                    item={item}
                    isActive={isActive(item.href)}
                      isCollapsed={isCollapsed}
                    onItemClick={handleItemClick}
                    shortcutKey={index < 5 ? `Alt+${index + 1}` : undefined}
                      theme={actualTheme}
                  />
                  </div>
                ))}
              </Suspense>
            </div>
          </div>

          {/* Book-themed Footer */}
          <footer 
            className={`border-t ${
              actualTheme === "dark" ? "border-slate-700/50" : "border-amber-800/50"
            } p-3 sm:p-4 flex-shrink-0 cursor-pointer ${
              actualTheme === "dark" ? "hover:bg-slate-800/20" : "hover:bg-amber-800/20"
            } transition-colors duration-200`}
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="text-center mb-2 sm:mb-3">
                  <div className="text-xs text-amber-200 italic hidden sm:block">
                    "A room without books is like a body without a soul."
                  </div>
                  <div className="text-xs text-amber-300 hidden sm:block">- Cicero</div>
                </div>
              )}
              <div className="space-y-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className={`flex items-center justify-center w-full px-3 py-2 text-sm ${
                    actualTheme === "dark" ? "text-slate-200 hover:text-white hover:bg-slate-800/50" : "text-amber-200 hover:text-white hover:bg-amber-800/50"
                  } rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-amber-900`}
                  title={actualTheme === "dark" ? "Switch to light mode (Alt+T)" : "Switch to dark mode (Alt+T)"}
                >
                  <div className="flex items-center space-x-2">
                    {actualTheme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {actualTheme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                        <span className="text-xs bg-amber-800/30 text-amber-200 px-2 py-1 rounded">
                          Alt+T
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSignOut?.();
                  }}
                  className={`flex items-center justify-center w-full px-3 py-2 text-sm ${
                    actualTheme === "dark" ? "text-slate-200 hover:text-white hover:bg-slate-800/50" : "text-amber-200 hover:text-white hover:bg-amber-800/50"
                  } rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-amber-900`}
                  title="Sign out"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span>Sign Out</span>}
                  </div>
                </button>
              </div>

              {!isCollapsed && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <div className="text-xs text-amber-300">📚</div>
                  <div className="text-xs text-amber-200">247 books</div>
                </div>
              )}
            </div>
          </footer>
        </nav>

        <KeyboardShortcutsHelp
          shortcuts={keyboardShortcuts}
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </>
    );
  }
);

// Book-themed Navigation Item Component
interface BookNavigationItemProps {
  item: any;
  isActive: boolean;
  isCollapsed: boolean;
  onItemClick: (item: any) => void;
  shortcutKey?: string | undefined;
  theme: "light" | "dark";
}

function BookNavigationItem({
  item,
  isActive,
  isCollapsed,
  onItemClick,
  shortcutKey,
  theme,
}: BookNavigationItemProps) {
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "dashboard":
        return BookOpen;
      case "library":
        return Library;
      case "discover":
        return Search;
      case "groups":
        return Users;
      case "chat":
        return MessageCircle;
      case "settings":
        return Settings;
      default:
        return BookOpen;
    }
  };

  const getEmoji = (name: string) => {
    switch (name.toLowerCase()) {
      case "dashboard":
        return "📚";
      case "library":
        return "📖";
      case "discover":
        return "🔍";
      case "groups":
        return "👥";
      case "chat":
        return "💬";
      case "settings":
        return "⚙️";
      default:
        return "📚";
    }
  };

  const Icon = getIcon(item.name);
  const emoji = getEmoji(item.name);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior since we're handling it manually
    onItemClick(item);
  }, [onItemClick, item]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Create a mock mouse event for consistency
        const mockEvent = { preventDefault: () => {} } as React.MouseEvent;
        handleClick(mockEvent);
      }
    },
    [handleClick]
  );

  const baseClasses = `
    group flex items-center w-full transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-amber-900
    px-3 sm:px-4 py-2 sm:py-3 rounded-xl mx-1 sm:mx-2 cursor-pointer
  `;

  const activeClasses = isActive
    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg transform scale-105"
    : theme === "dark" 
      ? "text-slate-200 hover:bg-slate-800/50 hover:text-white hover:shadow-md"
      : "text-amber-200 hover:bg-amber-800/50 hover:text-white hover:shadow-md";

  const collapsedClasses = isCollapsed ? "justify-center" : "";

  return (
    <Link
      href={item.href}
      className={`${baseClasses} ${activeClasses} ${collapsedClasses}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={isActive ? "page" : undefined}
      aria-label={`Go to ${item.name}`}
      title={shortcutKey ? `${shortcutKey} - ${item.name}` : item.name}
      role="menuitem"
      tabIndex={0}
    >
      <span className="flex-shrink-0">
        <div className="relative">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200" />
          {isActive && !isCollapsed && (
            <div className="absolute -top-1 -right-1 text-xs">{emoji}</div>
          )}
        </div>
      </span>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-xs sm:text-sm font-medium text-left ml-2 sm:ml-3 font-serif truncate">
            {item.name}
          </span>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {shortcutKey && (
              <span className="text-xs bg-amber-800/30 text-amber-200 px-1 sm:px-2 py-1 rounded hidden sm:block">
                {shortcutKey}
              </span>
            )}
          </div>
        </>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
            <div className="font-medium">{item.name}</div>
            {shortcutKey && <div className="text-xs text-gray-300 mt-1">{shortcutKey}</div>}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
          </div>
        </div>
      )}
    </Link>
  );
}

export default Navigation;