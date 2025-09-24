// src/contexts/index.ts
export { AppProvider, useApp, AppContext } from "./AppContext";
export { ThemeProvider, useTheme, ThemeContext } from "./ThemeContext";
export { CombinedProvider } from "./CombinedProvider";
export {
  OptimizedProvider,
  createOptimizedContext,
  createOptimizedHook,
  createSelectorHook,
} from "./OptimizedProvider";

// Re-export types
export type { Theme } from "./ThemeContext";
