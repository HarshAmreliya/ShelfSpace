import React from "react";
import { BookDetailFeature } from "@/components/book/BookDetailFeature";
import { parseBookSlug } from "@/lib/book-slug";

interface BookDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const BookDetailPage: React.FC<BookDetailPageProps> = async ({ params }) => {
  const { slug } = await params;
  const { id } = parseBookSlug(slug);

  return <BookDetailFeature bookId={id} />;
};

export default BookDetailPage;
