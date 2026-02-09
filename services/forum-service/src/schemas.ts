import { z } from "zod";

export const createForumSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export const updateForumSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export const createThreadSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(1).max(10000),
});

export const updateThreadSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  content: z.string().min(1).max(10000).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export const createPostSchema = z.object({
  content: z.string().min(1).max(10000),
  parentPostId: z.string().optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
});

export const reactionSchema = z.object({
  type: z.enum(["LIKE", "UPVOTE", "LAUGH", "SAD", "ANGRY"]),
});
