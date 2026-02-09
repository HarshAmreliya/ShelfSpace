import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  return <ProfilePageClient userId={username} />;
}
