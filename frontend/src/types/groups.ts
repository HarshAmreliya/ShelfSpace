export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  bookCount: number;
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

export interface GroupActivity {
  id: string;
  type: "book_added" | "book_discussion" | "member_joined" | "book_review";
  userId: string;
  userName: string;
  bookId?: string;
  bookTitle?: string;
  content?: string;
  createdAt: string;
}

export interface GroupInput {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
}

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
  avatar?: string;
}

export interface GroupDiscussion {
  id: string;
  groupId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  bookId?: string;
  bookTitle?: string;
  createdAt: string;
  updatedAt: string;
  replies: GroupReply[];
  likes: number;
  isPinned: boolean;
}

export interface GroupReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
}
