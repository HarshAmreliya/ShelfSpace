import { MoreHorizontal } from "lucide-react";

interface Group {
  name: string;
  members: number;
  currentBook: string;
}

interface Props {
  group: Group;
}

export default function GroupCard({ group }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{group.name}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">{group.members} members</p>
      <p className="text-sm text-purple-600 font-medium">
        Currently reading: {group.currentBook}
      </p>
    </div>
  );
}
