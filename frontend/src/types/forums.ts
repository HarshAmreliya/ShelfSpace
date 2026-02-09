export interface Forum {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  threadCount: number;
  isPublic: boolean;
  isJoined: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  recentActivity?: string;
  nextMeeting?: string;
  featuredBooks?: string[];
}

export interface ForumActivity {
  id: string;
  type: "thread_created" | "post_created" | "member_joined";
  userId: string;
  userName: string;
  threadId?: string;
  threadTitle?: string;
  content?: string;
  createdAt: string;
}

export interface ForumInput {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
}

export interface ForumMember {
  id: string;
  userId: string;
  userName: string;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
  avatar?: string;
}

export interface ForumThread {
  id: string;
  forumId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  replies: ForumPost[];
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumPost {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
}

// Backward-compatible aliases (temporary)
export type Group = Forum;
export type GroupActivity = ForumActivity;
export type GroupInput = ForumInput;
export type GroupMember = ForumMember;
export type GroupDiscussion = ForumThread;
export type GroupReply = ForumPost;
