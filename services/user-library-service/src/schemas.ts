import { z } from "zod";

export const createReadingListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  isPublic: z.boolean().optional().default(false),
  bookIds: z.array(z.string()).optional().default([]),
});

export const updateReadingListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  isPublic: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const moveBooksSchema = z.object({
  bookIds: z.array(z.string()).min(1),
  targetListId: z.string().uuid(),
});

