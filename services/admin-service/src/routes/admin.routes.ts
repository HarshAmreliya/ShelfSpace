import express, { Request, Response } from "express";
import prisma from "../prisma.ts";
import {
  createModerationLogSchema,
  updateBookValidationSchema,
} from "../schemas.ts";
import { isAuthenticated } from "../middlewares/auth.ts";
import { isAdmin } from "../middlewares/isAdmin.ts";
import { validate } from "../middlewares/validate.ts";
import { z } from "zod";
import axios from "axios";

const router = express.Router();

// Log a moderation action
router.post(
  "/moderation/log",
  isAuthenticated,
  isAdmin,
  validate(z.object({ body: createModerationLogSchema })),
  async (
    req: Request<{}, {}, z.infer<typeof createModerationLogSchema>>,
    res: Response<any | { error: string }>
  ) => {
    try {
      const log = await prisma.moderationLog.create({
        data: { ...req.body, moderatorId: req.userId! },
      });
      res.status(201).json(log);
    } catch (error: unknown) {
      console.error("Error creating moderation log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all moderation logs
router.get(
  "/moderation/logs",
  isAuthenticated,
  isAdmin,
  async (
    req: Request<{}, {}, {}, { limit?: string; offset?: string }>,
    res: Response<any[] | { error: string }>
  ) => {
    const limit = parseInt(req.query.limit || "10");
    const offset = parseInt(req.query.offset || "0");

    try {
      const logs = await prisma.moderationLog.findMany({
        skip: offset,
        take: limit,
        orderBy: { timestamp: "desc" },
      });
      res.json(logs);
    } catch (error: unknown) {
      console.error("Error fetching moderation logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update book validation status
router.put(
  "/book-validation/:bookId",
  isAuthenticated,
  isAdmin,
  validate(
    z.object({
      body: updateBookValidationSchema,
      params: z.object({ bookId: z.string() }),
    })
  ),
  async (
    req: Request<
      { bookId: string },
      {},
      z.infer<typeof updateBookValidationSchema>
    >,
    res: Response<any | { error: string }>
  ) => {
    const { bookId } = req.params;
    try {
      const updatedValidation = await prisma.bookValidation.upsert({
        where: { bookId },
        update: { ...req.body, validatorId: req.userId! },
        create: { bookId, ...req.body, validatorId: req.userId! },
      });
      res.json(updatedValidation);
    } catch (error: unknown) {
      console.error("Error updating book validation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get book validation status
router.get(
  "/book-validation/:bookId",
  isAuthenticated,
  isAdmin,
  validate(z.object({ params: z.object({ bookId: z.string() }) })),
  async (
    req: Request<{ bookId: string }>,
    res: Response<any | { error: string }>
  ) => {
    const { bookId } = req.params;
    try {
      const validation = await prisma.bookValidation.findUnique({
        where: { bookId },
      });
      if (!validation) {
        return res
          .status(404)
          .json({ error: "Book validation status not found" });
      }
      res.json(validation);
    } catch (error: unknown) {
      console.error("Error fetching book validation status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin: Update user status in user-service
router.put(
  "/users/:userId/status",
  isAuthenticated,
  isAdmin,
  validate(z.object({ body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"]) }) })),
  async (req: Request<{ userId: string }, {}, { status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED" }>, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body; // req.body is already validated by the 'validate' middleware
    try {
      // Assuming user-service is accessible via its service name in Docker Compose
      const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:3001";
      await axios.put(`${userServiceUrl}/api/users/${userId}/status`, { status }, {
        headers: {
          "x-user-id": req.userId, // Pass the admin's user ID for authentication/authorization in user-service
        },
      });
      res.status(200).json({ message: `User ${userId} status updated to ${status}` });
    } catch (error: any) {
      console.error("Error updating user status:", error.message);
      res.status(error.response?.status || 500).json({ error: error.response?.data?.error || "Internal server error" });
    }
  }
);

// Admin: Reset user preferences in user-service
router.put(
  "/users/:userId/preferences/reset",
  isAuthenticated,
  isAdmin,
  async (
    req: Request<{ userId: string }>,
    res: Response
  ) => {
    const { userId } = req.params;
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:3001";
      await axios.put(`${userServiceUrl}/api/users/${userId}/preferences/reset`, {}, {
        headers: {
          "x-user-id": req.userId, // Pass the admin's user ID
        },
      });
      res.status(200).json({ message: `User ${userId} preferences reset successfully` });
    } catch (error: any) {
      console.error("Error resetting user preferences:", error.message);
      res.status(error.response?.status || 500).json({ error: error.response?.data?.error || "Internal server error" });
    }
  }
);

export default router;
