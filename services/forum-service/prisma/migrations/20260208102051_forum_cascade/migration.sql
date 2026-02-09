-- DropForeignKey
ALTER TABLE "public"."ForumMembership" DROP CONSTRAINT "ForumMembership_forumId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumPost" DROP CONSTRAINT "ForumPost_parentPostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumPost" DROP CONSTRAINT "ForumPost_threadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumPostReaction" DROP CONSTRAINT "ForumPostReaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ForumThread" DROP CONSTRAINT "ForumThread_forumId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ForumMembership" ADD CONSTRAINT "ForumMembership_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "public"."Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumThread" ADD CONSTRAINT "ForumThread_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "public"."Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPost" ADD CONSTRAINT "ForumPost_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPost" ADD CONSTRAINT "ForumPost_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "public"."ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForumPostReaction" ADD CONSTRAINT "ForumPostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
