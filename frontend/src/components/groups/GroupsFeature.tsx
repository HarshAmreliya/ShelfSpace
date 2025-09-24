"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/common/LoadingStates/PageSkeleton";
import { Group } from "@/types/groups";
import {
  Users,
  Search,
  Plus,
  Star,
  MessageCircle,
  Calendar,
  UserPlus,
  BookOpen,
  TrendingUp,
  Filter,
  Grid,
  List,
  Eye,
  Clock,
  Pin,
  Lock,
} from "lucide-react";

type ViewMode = "grid" | "list";
type SortBy = "name" | "memberCount" | "bookCount" | "createdAt";
type SortOrder = "asc" | "desc";

// Temporary group data for demonstration
const temporaryGroups: Group[] = [
  {
    id: "1",
    name: "Fantasy Book Club",
    description: "A magical journey through fantasy worlds! We read and discuss the best fantasy novels, from classic Tolkien to modern masterpieces.",
    memberCount: 1247,
    bookCount: 89,
    tags: ["Fantasy", "Magic", "Adventure"],
    isJoined: false,
    isPublic: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    createdBy: "user123",
    recentActivity: "Discussion about 'The Name of the Wind'",
    nextMeeting: "2024-02-15T19:00:00Z"
  },
  {
    id: "2",
    name: "Sci-Fi Enthusiasts",
    description: "Exploring the cosmos of science fiction literature. From Asimov to contemporary sci-fi, we dive deep into futuristic worlds and ideas.",
    memberCount: 892,
    bookCount: 156,
    tags: ["Science Fiction", "Space", "Technology"],
    isJoined: true,
    isPublic: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-22T12:15:00Z",
    createdBy: "user456",
    recentActivity: "Book recommendation: 'Dune' series",
    nextMeeting: "2024-02-10T18:30:00Z"
  },
  {
    id: "3",
    name: "Mystery & Thriller Readers",
    description: "Unraveling mysteries one page at a time! Join us for spine-chilling discussions about the best mystery and thriller novels.",
    memberCount: 634,
    bookCount: 78,
    tags: ["Mystery", "Thriller", "Crime"],
    isJoined: false,
    isPublic: true,
    createdAt: "2024-01-05T14:00:00Z",
    updatedAt: "2024-01-21T09:45:00Z",
    createdBy: "user789",
    recentActivity: "Spoiler discussion: 'Gone Girl' ending",
    nextMeeting: "2024-02-12T20:00:00Z"
  },
  {
    id: "4",
    name: "Romance Book Lovers",
    description: "Celebrating love stories in all their forms! From contemporary romance to historical fiction, we share our favorite heartwarming reads.",
    memberCount: 2156,
    bookCount: 234,
    tags: ["Romance", "Contemporary", "Historical Fiction"],
    isJoined: true,
    isPublic: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-23T16:20:00Z",
    createdBy: "user321",
    recentActivity: "Monthly book swap event",
    nextMeeting: "2024-02-08T19:30:00Z"
  },
  {
    id: "5",
    name: "Non-Fiction Explorers",
    description: "Expanding our minds through non-fiction! We explore biographies, history, science, and self-improvement books together.",
    memberCount: 445,
    bookCount: 67,
    tags: ["Non-Fiction", "Biography", "History"],
    isJoined: false,
    isPublic: true,
    createdAt: "2024-01-12T16:00:00Z",
    updatedAt: "2024-01-20T11:30:00Z",
    createdBy: "user654",
    recentActivity: "Discussion: 'Sapiens' by Yuval Noah Harari",
    nextMeeting: "2024-02-14T17:00:00Z"
  },
  {
    id: "6",
    name: "Classic Literature Society",
    description: "Honoring the timeless classics! We read and analyze the greatest works of literature from different eras and cultures.",
    memberCount: 723,
    bookCount: 145,
    tags: ["Classics", "Literature", "Poetry"],
    isJoined: false,
    isPublic: true,
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-19T14:15:00Z",
    createdBy: "user987",
    recentActivity: "Reading: 'Pride and Prejudice' discussion",
    nextMeeting: "2024-02-16T18:00:00Z"
  }
];

export function GroupsFeature() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("memberCount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const allGroups = useMemo(() => {
    return temporaryGroups;
  }, []);

  const tags = useMemo(() => {
    const uniqueTags = new Set(allGroups.flatMap(group => group.tags));
    return Array.from(uniqueTags).sort();
  }, [allGroups]);

  const filteredAndSortedGroups = useMemo(() => {
    let filtered = allGroups.filter((group: Group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedTag) {
      filtered = filtered.filter((group: Group) => group.tags.includes(selectedTag));
    }

    if (showJoinedOnly) {
      filtered = filtered.filter((group: Group) => group.isJoined);
    }

    filtered.sort((a: Group, b: Group) => {
      let compareA: any;
      let compareB: any;

      switch (sortBy) {
        case "name":
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case "memberCount":
          compareA = a.memberCount;
          compareB = b.memberCount;
          break;
        case "bookCount":
          compareA = a.bookCount;
          compareB = b.bookCount;
          break;
        case "createdAt":
          compareA = new Date(a.createdAt).getTime();
          compareB = new Date(b.createdAt).getTime();
          break;
        default:
          compareA = a.memberCount;
          compareB = b.memberCount;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allGroups, searchQuery, selectedTag, sortBy, sortOrder, showJoinedOnly]);

  const popularGroups = useMemo(() => {
    return allGroups
      .filter((group: Group) => group.memberCount >= 1000)
      .sort((a: Group, b: Group) => b.memberCount - a.memberCount)
      .slice(0, 3);
  }, [allGroups]);

  const handleJoinGroup = (groupId: string) => {
    console.log(`Joining group ${groupId}`);
    // In a real app, this would make an API call
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log(`Leaving group ${groupId}`);
    // In a real app, this would make an API call
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  if (isLoading) {
    return <PageSkeleton variant="groups" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative z-10">
      {/* Decorative book-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-5 dark:opacity-10">📚</div>
        <div className="absolute top-40 right-20 text-4xl opacity-5 dark:opacity-10">📖</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-5 dark:opacity-10">📝</div>
        <div className="absolute bottom-40 right-1/3 text-3xl opacity-5 dark:opacity-10">✍️</div>
      </div>

      <div className="relative container mx-auto px-4 py-8 z-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 font-serif">
            Reading Groups
          </h1>
          <p className="text-xl text-gray-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Connect with fellow readers, share your thoughts, and discover new books through vibrant reading communities.
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{allGroups.length}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Active Groups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {allGroups.reduce((sum, group) => sum + group.memberCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {allGroups.reduce((sum, group) => sum + group.bookCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Books Discussed</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search groups, topics, or books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <div className="lg:w-48">
              <select
                value={selectedTag || ""}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Topics</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as SortBy);
                  setSortOrder(order as SortOrder);
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="memberCount-desc">Most Members</option>
                <option value="memberCount-asc">Least Members</option>
                <option value="bookCount-desc">Most Books</option>
                <option value="bookCount-asc">Least Books</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showJoinedOnly}
                onChange={(e) => setShowJoinedOnly(e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">Show only joined groups</span>
            </label>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-slate-400">
            Showing {filteredAndSortedGroups.length} of {allGroups.length} groups
          </div>
        </div>

        {/* Popular Groups Section */}
        {popularGroups.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif">
                Popular Groups
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                  onView={handleViewGroup}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif">
              All Groups
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              Create Group
            </button>
          </div>

          {filteredAndSortedGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                No groups found
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Try adjusting your search criteria or create a new group.
              </p>
              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedGroups.map((group) => (
                viewMode === "grid" ? (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    onView={handleViewGroup}
                  />
                ) : (
                  <GroupListItem
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    onView={handleViewGroup}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Group Card Component
interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  onView: (groupId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, onLeave, onView }) => {
  return (
    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-2">
            {group.name}
          </h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            {group.description}
          </p>
        </div>
        {group.isJoined && (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded-full">
            Joined
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {group.memberCount.toLocaleString()} members
        </div>
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          {group.bookCount} books
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {group.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-slate-300 text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
        {group.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-400 text-xs rounded-full">
            +{group.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-slate-500 mb-4">
        <div className="flex items-center mb-1">
          <MessageCircle className="h-3 w-3 mr-1" />
          Recent: {group.recentActivity}
        </div>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Next meeting: {new Date(group.nextMeeting).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        {group.isJoined ? (
          <button
            onClick={() => onLeave(group.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Leave Group
          </button>
        ) : (
          <button
            onClick={() => onJoin(group.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Join Group
          </button>
        )}
        <button 
          onClick={() => onView(group.id)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
        >
          View Forum
        </button>
      </div>
    </div>
  );
};

// Group List Item Component
const GroupListItem: React.FC<GroupCardProps> = ({ group, onJoin, onLeave, onView }) => {
  return (
    <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {group.name}
            </h3>
            {group.isJoined && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded-full">
                Joined
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
            {group.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.memberCount.toLocaleString()} members
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {group.bookCount} books
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {group.recentActivity}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {group.isJoined ? (
            <button
              onClick={() => onLeave(group.id)}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-sm font-medium transition-colors"
            >
              Leave
            </button>
          ) : (
            <button
              onClick={() => onJoin(group.id)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm font-medium transition-colors"
            >
              Join
            </button>
          )}
          <button 
            onClick={() => onView(group.id)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded text-sm font-medium transition-colors"
          >
            Forum
          </button>
        </div>
      </div>
    </div>
  );
};