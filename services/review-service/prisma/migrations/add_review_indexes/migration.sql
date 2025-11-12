-- Add indexes for frequently queried fields in Review table

-- Index on bookId for faster lookups when fetching reviews by book
CREATE INDEX IF NOT EXISTS "Review_bookId_idx" ON "Review"("bookId");

-- Index on userId for faster lookups when fetching reviews by user
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");

-- Composite index for common query pattern: book reviews sorted by date
CREATE INDEX IF NOT EXISTS "Review_bookId_createdAt_idx" ON "Review"("bookId", "createdAt" DESC);

-- Composite index for user reviews sorted by date
CREATE INDEX IF NOT EXISTS "Review_userId_createdAt_idx" ON "Review"("userId", "createdAt" DESC);

