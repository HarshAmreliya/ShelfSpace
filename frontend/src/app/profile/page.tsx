import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | ShelfSpace",
  description: "View and manage your ShelfSpace profile and preferences.",
  alternates: { canonical: "/profile" },
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <div className="bg-whiteBg min-h-screen text-black">
      {/* ...existing content... */}
    </div>
  );
}
