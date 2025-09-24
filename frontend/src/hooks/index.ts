// src/hooks/index.ts
// State management hooks
export * from "./library";
export * from "./dashboard";
export * from "./navigation";
export * from "./chat";
export * from "./data";

// Persistence hooks
export { useLocalStorage } from "./useLocalStorage";
export {
  usePersistedState,
  usePersistedPreferences,
  usePersistedSettings,
} from "./usePersistedState";
export { useImageLoader } from "./useImageLoader";

// Accessibility hooks
export {
  useKeyboardNavigation,
  commonShortcuts,
} from "./useKeyboardNavigation";

// Re-export types
export type { UseLocalStorageOptions } from "./useLocalStorage";
export type { UsePersistedStateOptions } from "./usePersistedState";
