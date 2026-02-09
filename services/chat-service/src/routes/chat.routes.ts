import express from "express";
import prisma from "../prisma.js";
import { isAuthenticated, isGroupMember } from "../middlewares/auth.ts";
import axios from "axios";

const router = express.Router();
const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL?.trim() || "";

async function emitAnalyticsEvents(
  req: express.Request,
  events: Array<Record<string, any>>
) {
  if (!ANALYTICS_SERVICE_URL || events.length === 0) return;
  const authHeader = req.headers.authorization;
  if (!authHeader) return;
  try {
    await axios.post(
      `${ANALYTICS_SERVICE_URL}/api/analytics/events`,
      { events },
      { headers: { Authorization: authHeader } }
    );
  } catch (error) {
    console.warn("Failed to emit analytics events");
  }
}

// Get message history for a group
router.get("/groups/:groupId/messages", isAuthenticated, isGroupMember, async (req, res) => {
  const { groupId } = req.params;
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const messages = await prisma.message.findMany({
      where: { groupId },
      orderBy: { timestamp: "asc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        senderId: true,
        groupId: true,
        content: true,
        timestamp: true,
      },
    });
    res.json(messages);

    await emitAnalyticsEvents(req, [
      {
        type: "CHAT_SESSION_UPDATED",
        userId: req.userId,
        payload: { sessionId: groupId, reason: "messages_viewed" },
      },
    ]);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
