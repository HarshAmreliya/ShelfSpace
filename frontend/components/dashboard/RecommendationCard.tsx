import { Plus } from "lucide-react";

interface BookRecommendation {
  title: string;
  author: string;
  cover: string;
  reason: string;
}

interface Props {
  book: BookRecommendation;
}

export default function RecommendationCard({ book }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{book.cover}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">{book.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{book.author}</p>
          <p className="text-purple-600 text-xs bg-purple-50 px-2 py-1 rounded-full inline-block">
            {book.reason}
          </p>
        </div>
        <button className="text-gray-400 hover:text-purple-600 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
