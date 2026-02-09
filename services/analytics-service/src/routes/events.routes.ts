import { Router } from "express";
import { z } from "zod";
import { getCollections } from "../db.js";
import { projectEvent } from "../projections/projector.js";
import type { AnalyticsEvent } from "../types/events.js";

const router = Router();

const eventSchema = z.object({
  userId: z.string().min(1).optional(),
  type: z.enum([
    "BOOK_ADDED",
    "BOOK_STATUS_CHANGED",
    "BOOK_RATED",
    "BOOK_PROGRESS",
    "READING_SESSION",
    "BOOK_FINISHED",
    "READING_LIST_CREATED",
    "READING_LIST_UPDATED",
    "READING_LIST_DELETED",
    "READING_LIST_BOOKS_MOVED",
    "READING_LIST_BOOKS_REMOVED",
    "USER_CREATED",
    "USER_PROFILE_UPDATED",
    "USER_PREFERENCES_UPDATED",
    "USER_STATUS_UPDATED",
    "USER_PREFERENCES_RESET",
    "BOOK_CREATED",
    "BOOK_UPDATED",
    "BOOK_DELETED",
    "BOOK_VIEWED",
    "BOOK_SEARCHED",
    "FORUM_CREATED",
    "FORUM_UPDATED",
    "FORUM_DELETED",
    "FORUM_JOINED",
    "FORUM_LEFT",
    "THREAD_CREATED",
    "THREAD_UPDATED",
    "THREAD_DELETED",
    "POST_CREATED",
    "POST_UPDATED",
    "POST_DELETED",
    "POST_REACTED",
    "THREAD_REACTED",
    "CHAT_SESSION_CREATED",
    "CHAT_SESSION_UPDATED",
    "CHAT_SESSION_DELETED",
    "CHAT_MESSAGE_SENT",
    "CHATBOT_QUERY",
    "MODERATION_LOG_CREATED",
    "BOOK_VALIDATION_UPDATED",
    "ADMIN_USER_STATUS_UPDATED",
    "ADMIN_PREFERENCES_RESET",
  ]),
  timestamp: z.string().optional(),
  payload: z
    .object({
      bookId: z.string().optional(),
      title: z.string().optional(),
      author: z.string().optional(),
      pages: z.number().optional(),
      genres: z.array(z.string()).optional(),
      status: z.string().optional(),
      previousStatus: z.string().optional(),
      rating: z.number().optional(),
      progress: z.number().optional(),
      minutes: z.number().optional(),
      listName: z.string().optional(),
      listId: z.string().optional(),
      forumId: z.string().optional(),
      forumName: z.string().optional(),
      threadId: z.string().optional(),
      threadTitle: z.string().optional(),
      postId: z.string().optional(),
      reaction: z.string().optional(),
      query: z.string().optional(),
      messageLength: z.number().optional(),
      sessionId: z.string().optional(),
      reason: z.string().optional(),
      targetUserId: z.string().optional(),
    })
    .optional(),
});

const eventsSchema = z.object({
  events: z.array(eventSchema).min(1),
});

router.post("/events", async (req, res) => {
  try {
    const body = req.body;
    const parsed = Array.isArray(body)
      ? { events: body }
      : body?.events
      ? body
      : { events: [body] };

    const { events } = eventsSchema.parse(parsed);
    const { events: eventsCollection, analytics } = await getCollections();

    for (const event of events) {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (event.userId && event.userId !== req.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const eventDoc: AnalyticsEvent = {
        ...event,
        userId: req.userId,
        timestamp: event.timestamp || new Date().toISOString(),
      };
      await eventsCollection.insertOne(eventDoc);
      await projectEvent(analytics, eventDoc);
    }

    res.json({ success: true, processed: events.length });
  } catch (error: any) {
    console.error("Failed to ingest analytics events:", error);
    res.status(400).json({ error: error?.message || "Invalid event payload" });
  }
});

export default router;
