import express, { Request, Response } from "express";
import prisma from "../prisma";
import {
  createModerationLogSchema,
  updateBookValidationSchema,
} from "../schemas";
import { isAuthenticated } from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = express.Router();

// Log a moderation action
router.post(
  "/moderation/log",
  isAuthenticated,
  isAdmin,
  validate(z.object({ body: createModerationLogSchema })),
  async (req: Request<{}, {}, z.infer<typeof createModerationLogSchema>>, res: Response) => {
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
  async (req: Request<{}, {}, {}, { limit?: string; offset?: string }>, res: Response) => {
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
  validate(z.object({ body: updateBookValidationSchema, params: z.object({ bookId: z.string() }) })),
  async (req: Request<{ bookId: string }, {}, z.infer<typeof updateBookValidationSchema>>, res: Response) => {
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
  async (req: Request<{ bookId: string }>, res: Response) => {
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

export default router;
