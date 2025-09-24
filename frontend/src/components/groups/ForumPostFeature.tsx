"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Plus,
  Pin,
  Lock,
  Eye,
  Clock,
  ThumbsUp,
  Reply,
  Edit3,
  MoreHorizontal,
  BookOpen,
  Calendar,
  User,
  Send,
  Heart,
  Flag,
} from "lucide-react";

interface ForumPostFeatureProps {
  groupId: string;
  postId: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
  isLiked?: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  comments: Comment[];
}

export function ForumPostFeature({ groupId, postId }: ForumPostFeatureProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);

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
  };

  // Mock forum post data
  const forumPost: ForumPost = {
    id: postId,
    title: "Discussion: The Name of the Wind - Chapter 1-5",
    content: `Let's discuss the first five chapters of 'The Name of the Wind' by Patrick Rothfuss. 

I'm absolutely blown away by the world-building in these opening chapters. The way Rothfuss introduces us to Kvothe's world through the frame story is masterful. We get glimpses of the magic system, the political landscape, and Kvothe's mysterious past.

**Key Points for Discussion:**

1. **Character Development**: What do you think about Kvothe's character? He seems both incredibly talented and deeply flawed. The way he handles the draccus situation shows his quick thinking, but also his recklessness.

2. **Magic System**: The sympathy magic is fascinating. The way it's explained through the candle demonstration really helps visualize how it works. What are your thoughts on the rules and limitations?

3. **World Building**: The University, the Archives, the different countries and cultures mentioned - it all feels so rich and lived-in. Which aspects intrigue you most?

4. **Foreshadowing**: There are so many hints about what's to come. The way Kvothe talks about his past suggests he's done some incredible things. What predictions do you have?

5. **Writing Style**: Rothfuss's prose is beautiful. The way he describes things, the rhythm of his sentences - it's almost poetic at times.

I'd love to hear everyone's thoughts on these chapters! What stood out to you? What questions do you have? Let's dive deep into this amazing book together!`,
    author: "Emily Rodriguez",
    authorAvatar: "ER",
    createdAt: "2024-01-18T14:20:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    replies: 18,
    views: 89,
    likes: 32,
    isPinned: false,
    isLocked: false,
    tags: ["Discussion", "The Name of the Wind", "Fantasy"],
    comments: [
      {
        id: "1",
        content: "Great analysis! I completely agree about the magic system. The sympathy explanation was so well done - it felt natural and believable. I'm really curious about the different types of magic mentioned, especially naming.",
        author: "Sarah Johnson",
        authorAvatar: "SJ",
        createdAt: "2024-01-18T16:30:00Z",
        likes: 8,
        replies: [
          {
            id: "1-1",
            content: "Yes! The naming magic seems so mysterious. I love how Kvothe hints at it but doesn't fully explain it yet.",
            author: "Mike Chen",
            authorAvatar: "MC",
            createdAt: "2024-01-18T17:45:00Z",
            likes: 3,
            replies: []
          }
        ]
      },
      {
        id: "2",
        content: "I'm fascinated by Kvothe's character. He's clearly brilliant but also seems to have a chip on his shoulder. The way he handles the draccus shows both his intelligence and his tendency to take risks. What do you think drives him?",
        author: "Alex Thompson",
        authorAvatar: "AT",
        createdAt: "2024-01-18T18:15:00Z",
        likes: 12,
        replies: [
          {
            id: "2-1",
            content: "I think his past trauma really shapes him. The way he talks about his family suggests there's so much more to his story.",
            author: "Lisa Wang",
            authorAvatar: "LW",
            createdAt: "2024-01-18T19:20:00Z",
            likes: 5,
            replies: []
          },
          {
            id: "2-2",
            content: "Absolutely! And I think his pride is both his greatest strength and weakness. It drives him to excel but also gets him into trouble.",
            author: "David Kim",
            authorAvatar: "DK",
            createdAt: "2024-01-18T20:10:00Z",
            likes: 7,
            replies: []
          }
        ]
      },
      {
        id: "3",
        content: "The University setting is so rich! I love all the different masters and their personalities. Master Elodin seems particularly interesting - there's definitely more to him than meets the eye.",
        author: "Maria Garcia",
        authorAvatar: "MG",
        createdAt: "2024-01-19T09:30:00Z",
        likes: 6,
        replies: []
      },
      {
        id: "4",
        content: "Has anyone else noticed how Rothfuss uses music throughout these chapters? Kvothe's connection to music seems to be a key part of his character and possibly his magic. The way he describes playing the lute is beautiful.",
        author: "Tom Anderson",
        authorAvatar: "TA",
        createdAt: "2024-01-19T11:45:00Z",
        likes: 9,
        replies: [
          {
            id: "4-1",
            content: "Yes! Music seems to be his emotional outlet and possibly connected to his magic. I'm excited to see how this develops.",
            author: "Rachel Brown",
            authorAvatar: "RB",
            createdAt: "2024-01-19T12:30:00Z",
            likes: 4,
            replies: []
          }
        ]
      }
    ]
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("Adding comment:", newComment);
      // In a real app, this would make an API call
      setNewComment("");
    }
  };

  const handleAddReply = (commentId: string) => {
    if (replyContent.trim()) {
      console.log(`Adding reply to comment ${commentId}:`, replyContent);
      // In a real app, this would make an API call
      setReplyContent("");
      setShowReplyForm(null);
    }
  };

  const handleLikeComment = (commentId: string) => {
    console.log(`Liking comment ${commentId}`);
    // In a real app, this would make an API call
  };

  const handleLikePost = () => {
    console.log("Liking post");
    // In a real app, this would make an API call
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-6 animate-pulse">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Loading Discussion...
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

      <div className="relative container mx-auto px-4 py-8 z-20 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-50 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to {group.name}
        </button>

        {/* Forum Post */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-8 mb-8">
          {/* Post Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {forumPost.authorAvatar}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 font-serif">
                  {forumPost.title}
                </h1>
                {forumPost.isPinned && (
                  <Pin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
                {forumPost.isLocked && (
                  <Lock className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400 mb-4">
                <span className="font-medium text-gray-800 dark:text-slate-200">{forumPost.author}</span>
                <span>•</span>
                <span>{new Date(forumPost.createdAt).toLocaleDateString()}</span>
                {forumPost.updatedAt !== forumPost.createdAt && (
                  <>
                    <span>•</span>
                    <span className="text-gray-500 dark:text-slate-500">edited</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {forumPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-slate-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-slate-300 mb-6">
            <div className="whitespace-pre-wrap leading-relaxed">
              {forumPost.content}
            </div>
          </div>

          {/* Post Stats and Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-amber-200 dark:border-slate-700">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {forumPost.comments.length} comments
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {forumPost.views} views
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {forumPost.likes} likes
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikePost}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                Like
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg transition-colors">
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif">
            Comments ({forumPost.comments.length})
          </h2>

          {/* Add Comment Form */}
          <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Add a Comment
            </h3>
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this discussion..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {forumPost.comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-slate-700 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {comment.authorAvatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {comment.author}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 mb-4 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {comment.likes} likes
                        </button>
                        <button
                          onClick={() => setShowReplyForm(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {showReplyForm === comment.id && (
                  <div className="ml-16 bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-slate-700 p-4">
                    <div className="space-y-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.author}...`}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowReplyForm(null)}
                          className="px-4 py-1 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className="flex items-center gap-1 px-4 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                        >
                          <Send className="h-3 w-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-16 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-slate-700 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {reply.authorAvatar}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {reply.author}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-2">
                              {reply.content}
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleLikeComment(reply.id)}
                                className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {reply.likes} likes
                              </button>
                              <button className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                <Reply className="h-3 w-3" />
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
