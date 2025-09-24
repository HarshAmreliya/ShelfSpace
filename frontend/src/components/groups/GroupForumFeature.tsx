"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Plus,
  Search,
  Pin,
  Lock,
  Eye,
  Clock,
  ThumbsUp,
  Reply,
  BookOpen,
  Calendar,
} from "lucide-react";

interface GroupForumFeatureProps {
  groupId: string;
}

export function GroupForumFeature({ groupId }: GroupForumFeatureProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock group data
  const group = {
    id: groupId,
    name: "Fantasy Book Club",
    description: "A magical journey through fantasy worlds! We read and discuss the best fantasy novels.",
    memberCount: 1247,
    bookCount: 89,
    tags: ["Fantasy", "Magic", "Adventure"],
    isJoined: true,
  };

  // Mock forum posts
  const forumPosts = [
    {
      id: "1",
      title: "Welcome to our Fantasy Book Club!",
      content: "Welcome everyone! I'm excited to start this journey through fantasy literature with all of you. Our first book will be 'The Name of the Wind' by Patrick Rothfuss.",
      author: "Sarah Johnson",
      createdAt: "2024-01-15T10:00:00Z",
      replies: 23,
      views: 156,
      likes: 45,
      isPinned: true,
      tags: ["Announcement", "Welcome"]
    },
    {
      id: "2",
      title: "Discussion: The Name of the Wind - Chapter 1-5",
      content: "Let's discuss the first five chapters of 'The Name of the Wind'. What do you think about Kvothe's character development?",
      author: "Emily Rodriguez",
      createdAt: "2024-01-18T14:20:00Z",
      replies: 18,
      views: 89,
      likes: 32,
      isPinned: false,
      tags: ["Discussion", "The Name of the Wind"]
    },
    {
      id: "3",
      title: "Book Recommendations for Fantasy Lovers",
      content: "I've been reading fantasy for years and wanted to share some hidden gems. 'The Lies of Locke Lamora' by Scott Lynch is fantastic!",
      author: "Alex Thompson",
      createdAt: "2024-01-19T16:45:00Z",
      replies: 31,
      views: 124,
      likes: 67,
      isPinned: false,
      tags: ["Recommendations", "Fantasy"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-6 animate-pulse">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Loading Forum...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative z-10">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-5 dark:opacity-10">📚</div>
        <div className="absolute top-40 right-20 text-4xl opacity-5 dark:opacity-10">📖</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-5 dark:opacity-10">📝</div>
      </div>

      <div className="relative container mx-auto px-4 py-8 z-20">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-50 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Groups
        </button>

        {/* Group Header */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-2">
                {group.name}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-lg mb-4">
                {group.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.memberCount.toLocaleString()} members
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {group.bookCount} books discussed
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {forumPosts.length} discussions
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors text-sm font-medium">
                <Users className="h-4 w-4 mr-1 inline" />
                Joined
              </button>
            </div>
          </div>
        </div>

        {/* Forum Controls */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              New Discussion
            </button>
          </div>
        </div>

        {/* Forum Posts */}
        <div className="space-y-6">
          {/* Pinned Posts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Pinned Discussions
              </h2>
            </div>
            <div className="space-y-4">
              {forumPosts.filter(post => post.isPinned).map((post) => (
                <div key={post.id} className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => router.push(`/groups/${groupId}/posts/${post.id}`)}
                              className="text-lg font-semibold text-gray-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer text-left"
                            >
                              {post.title}
                            </button>
                            <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                            <span className="font-medium text-gray-800 dark:text-slate-200">{post.author}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 mb-4">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-slate-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.replies} replies
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views} views
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes} likes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg transition-colors text-sm">
                            <ThumbsUp className="h-4 w-4" />
                            Like
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors text-sm">
                            <Reply className="h-4 w-4" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regular Posts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-gray-600 dark:text-slate-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Recent Discussions
              </h2>
            </div>
            <div className="space-y-4">
              {forumPosts.filter(post => !post.isPinned).map((post) => (
                <div key={post.id} className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <button
                            onClick={() => router.push(`/groups/${groupId}/posts/${post.id}`)}
                            className="text-lg font-semibold text-gray-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer text-left mb-1"
                          >
                            {post.title}
                          </button>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                            <span className="font-medium text-gray-800 dark:text-slate-200">{post.author}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 mb-4">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-slate-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.replies} replies
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views} views
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes} likes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg transition-colors text-sm">
                            <ThumbsUp className="h-4 w-4" />
                            Like
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors text-sm">
                            <Reply className="h-4 w-4" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}