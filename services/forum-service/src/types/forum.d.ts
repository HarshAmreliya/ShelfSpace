export interface Forum {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  tags: string[];
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  memberships?: ForumMembership[];
}

export interface ForumMembership {
  id: string;
  forumId: string;
  userId: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  createdAt: Date;
}

export interface ForumThread {
  id: string;
  forumId: string;
  title: string;
  content: string;
  createdById: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  parentPostId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPostReaction {
  id: string;
  postId: string;
  userId: string;
  type: "LIKE" | "UPVOTE" | "LAUGH" | "SAD" | "ANGRY";
  createdAt: Date;
}
