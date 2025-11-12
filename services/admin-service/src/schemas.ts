import { z } from 'zod';
import { ModerationAction, ValidationStatus } from '@prisma/client';

export const createModerationLogSchema = z.object({
  action: z.nativeEnum(ModerationAction),
  targetId: z.string(),
  reason: z.string().optional(),
});

export const updateBookValidationSchema = z.object({
  status: z.nativeEnum(ValidationStatus),
  notes: z.string().optional(),
});
