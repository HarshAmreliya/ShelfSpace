import React from "react";
import { BookDetailFeature } from "@/components/book/BookDetailFeature";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const BookDetailPage: React.FC<BookDetailPageProps> = async ({ params }) => {
  const { id } = await params;

  return <BookDetailFeature bookId={id} />;
};

export default BookDetailPage;