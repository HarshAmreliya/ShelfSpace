// Mock data exports
export * from "./users";
export * from "./chat";
export * from "./books";
export * from "./readingLists";
export * from "./bookDetails";
export * from "./groups";

// Transformers exports (with specific names to avoid conflicts)
export { DataTransformer } from "./transformers";
export { 
  mockBookDetails, 
  mockSimilarBooks, 
  mockDiscussions, 
  mockReviews 
} from "./transformers";
