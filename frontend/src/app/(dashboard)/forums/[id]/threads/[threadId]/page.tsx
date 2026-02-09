import { ForumPostFeature } from "@/components/forums/ForumPostFeature";

interface ForumPostPageProps {
  params: Promise<{
    id: string;
    threadId: string;
  }>;
}

export const metadata = {
  title: "Forum Post - ShelfSpace",
  description: "Join the discussion in this forum post.",
};

export default async function ForumPostPage({ params }: ForumPostPageProps) {
  const { id, threadId } = await params;

  return <ForumPostFeature forumId={id} threadId={threadId} />;
}
