import { ForumFeature } from "@/components/forums/ForumFeature";

interface GroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Group Forum - ShelfSpace",
  description: "Join the discussion in your reading group.",
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params;

  return <ForumFeature forumId={id} />;
}
