/*
  Warnings:

  - You are about to drop the `ChatConversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatConversation" DROP CONSTRAINT "ChatConversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_conversationId_fkey";

-- DropTable
DROP TABLE "public"."ChatConversation";

-- DropTable
DROP TABLE "public"."ChatMessage";

-- DropEnum
DROP TYPE "public"."MessageRole";

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatSession_userId_lastMessageAt_idx" ON "public"."ChatSession"("userId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatSession_userId_isPinned_idx" ON "public"."ChatSession"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "ChatSession_expiresAt_idx" ON "public"."ChatSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
