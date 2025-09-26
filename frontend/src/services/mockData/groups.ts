import { Group, GroupActivity, GroupDiscussion } from "@/types/groups";

export const mockGroups: Group[] = [
  {
    id: "1",
    name: "Classic Literature Enthusiasts",
    description: "A community for lovers of classic literature, from Shakespeare to modern classics. Share your thoughts on timeless works.",
    memberCount: 1247,
    bookCount: 89,
    isPublic: true,
    isJoined: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    createdBy: "literature_lover_42",
    tags: ["classic-literature", "shakespeare", "dickens", "discussion"],
    recentActivity: [
      {
        id: "1",
        type: "book_discussion",
        userId: "bookworm_99",
        userName: "Sarah Johnson",
        bookId: "1",
        bookTitle: "The Great Gatsby",
        content: "Just finished reading The Great Gatsby for the third time. The symbolism of the green light never gets old!",
        createdAt: "2024-01-20T10:30:00Z"
      },
      {
        id: "2",
        type: "member_joined",
        userId: "new_reader_23",
        userName: "Mike Chen",
        createdAt: "2024-01-20T09:15:00Z"
      }
    ],
    featuredBooks: ["1", "2", "3"]
  },
  {
    id: "2",
    name: "Sci-Fi & Fantasy Readers",
    description: "Explore the vast universes of science fiction and fantasy. From space operas to epic quests, we discuss it all.",
    memberCount: 2156,
    bookCount: 156,
    isPublic: true,
    isJoined: false,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
    createdBy: "space_explorer_7",
    tags: ["science-fiction", "fantasy", "space-opera", "magic"],
    recentActivity: [
      {
        id: "3",
        type: "book_review",
        userId: "sci_fi_fan_88",
        userName: "Alex Rivera",
        bookId: "4",
        bookTitle: "Dune",
        content: "Dune is a masterpiece of world-building. Herbert's vision of Arrakis is incredible!",
        createdAt: "2024-01-19T14:20:00Z"
      }
    ],
    featuredBooks: ["4", "5", "6"]
  },
  {
    id: "3",
    name: "Mystery & Thriller Club",
    description: "For fans of suspense, mystery, and psychological thrillers. Can you solve the case before the detective?",
    memberCount: 892,
    bookCount: 67,
    isPublic: true,
    isJoined: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
    createdBy: "detective_reader",
    tags: ["mystery", "thriller", "suspense", "crime"],
    recentActivity: [
      {
        id: "4",
        type: "book_added",
        userId: "mystery_lover_55",
        userName: "Emma Wilson",
        bookId: "7",
        bookTitle: "Gone Girl",
        createdAt: "2024-01-18T16:45:00Z"
      }
    ],
    featuredBooks: ["7", "8", "9"]
  },
  {
    id: "4",
    name: "Non-Fiction Book Club",
    description: "Expand your knowledge with biographies, history, science, and self-improvement books.",
    memberCount: 634,
    bookCount: 45,
    isPublic: true,
    isJoined: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-17T00:00:00Z",
    createdBy: "knowledge_seeker",
    tags: ["non-fiction", "biography", "history", "self-improvement"],
    recentActivity: [
      {
        id: "5",
        type: "book_discussion",
        userId: "history_buff_33",
        userName: "David Kim",
        bookId: "10",
        bookTitle: "Sapiens",
        content: "Yuval Noah Harari's perspective on human history is mind-blowing. Highly recommend!",
        createdAt: "2024-01-17T11:30:00Z"
      }
    ],
    featuredBooks: ["10", "11", "12"]
  },
  {
    id: "5",
    name: "Poetry & Short Stories",
    description: "A intimate group for lovers of poetry and short fiction. Share your favorite verses and discover new voices.",
    memberCount: 423,
    bookCount: 78,
    isPublic: true,
    isJoined: true,
    createdAt: "2023-12-20T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
    createdBy: "poetry_lover_19",
    tags: ["poetry", "short-stories", "literature", "creative-writing"],
    recentActivity: [
      {
        id: "6",
        type: "book_discussion",
        userId: "verse_master_77",
        userName: "Lisa Anderson",
        bookId: "13",
        bookTitle: "The Collected Poems of Emily Dickinson",
        content: "Dickinson's use of dashes and unconventional punctuation creates such unique rhythm.",
        createdAt: "2024-01-16T13:15:00Z"
      }
    ],
    featuredBooks: ["13", "14", "15"]
  }
];

export const mockGroupDiscussions: GroupDiscussion[] = [
  {
    id: "1",
    groupId: "1",
    title: "What's your favorite Shakespeare play?",
    content: "I've been reading through Shakespeare's works and I'm curious about everyone's favorite play. Mine is definitely Hamlet - the soliloquies are incredible!",
    authorId: "shakespeare_fan_42",
    authorName: "John Smith",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-01-20T08:00:00Z",
    replies: [
      {
        id: "1",
        discussionId: "1",
        content: "I love Macbeth! The psychological depth and the way Shakespeare explores ambition is fascinating.",
        authorId: "bard_lover_99",
        authorName: "Maria Garcia",
        createdAt: "2024-01-20T09:30:00Z",
        likes: 5
      },
      {
        id: "2",
        discussionId: "1",
        content: "Romeo and Juliet for me - tragic but beautiful. The language is so poetic.",
        authorId: "romance_reader_23",
        authorName: "Tom Wilson",
        createdAt: "2024-01-20T10:15:00Z",
        likes: 3
      }
    ],
    likes: 12,
    isPinned: true
  },
  {
    id: "2",
    groupId: "2",
    title: "Best space opera series recommendations?",
    content: "I'm looking for some epic space opera series to dive into. I've read Dune and Foundation, what else should I check out?",
    authorId: "space_cadet_88",
    authorName: "Alex Rivera",
    createdAt: "2024-01-19T14:00:00Z",
    updatedAt: "2024-01-19T14:00:00Z",
    replies: [
      {
        id: "3",
        discussionId: "2",
        content: "The Expanse series by James S.A. Corey is fantastic! Great character development and realistic physics.",
        authorId: "sci_fi_expert_55",
        authorName: "Sarah Chen",
        createdAt: "2024-01-19T15:20:00Z",
        likes: 8
      }
    ],
    likes: 7,
    isPinned: false
  }
];

export const generateMockGroups = (): Group[] => mockGroups;
