// src/contexts/ThemeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light" | "dark"; // The actual applied theme (resolved from system)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Function to get the actual theme based on system preference
  const getActualTheme = useCallback((themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return themeValue;
  }, []);

  // Function to apply theme to DOM
  const applyTheme = useCallback(
    (themeValue: Theme) => {
      const root = document.documentElement;
      const actual = getActualTheme(themeValue);

      if (actual === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      setActualTheme(actual);
    },
    [getActualTheme]
  );

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);

      // Persist theme preference
      try {
        localStorage.setItem("theme", newTheme);
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    },
    [applyTheme]
  );

  // Toggle between light and dark (ignoring system)
  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [actualTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Try to load saved theme
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);

        // Apply theme directly to avoid dependency loop
        const root = document.documentElement;
        const actual =
          savedTheme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : savedTheme;

        if (actual === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        setActualTheme(actual);
        return;
      }
    } catch (error) {
      console.error("Failed to load saved theme:", error);
    }

    // Apply default theme directly
    setThemeState(defaultTheme);
    const root = document.documentElement;
    const actual =
      defaultTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : defaultTheme;

    if (actual === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setActualTheme(actual);
  }, [defaultTheme]); // Remove applyTheme dependency

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        // Apply theme directly to avoid dependency loop
        const root = document.documentElement;
        const actual = mediaQuery.matches ? "dark" : "light";

        if (actual === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        setActualTheme(actual);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]); // Remove applyTheme dependency

  const contextValue: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export context for testing
export { ThemeContext };
