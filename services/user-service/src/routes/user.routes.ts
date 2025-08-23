import express from "express";
import prisma from "../prisma.ts";
import { updateUserSchema, updatePreferencesSchema } from "../schemas.ts";
import type { Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { User, UserStats, Preferences } from "../types/user.d.ts";
import { z } from "zod";

const router = express.Router();

router.use(isAuthenticated);

router.get("/me", async (req: Request, res: Response<User>) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: Missing user-id" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true, stats: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/me - Update user profile
router.put(
  "/me",
  validate(z.object({ body: updateUserSchema })),
  async (req: Request<{}, User, z.infer<typeof updateUserSchema>>, res: Response<User>) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing x-user-id header" });
      return;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: req.body,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/me/preferences - Retrieve user preferences
router.get("/me/preferences", async (req: Request, res: Response<Preferences>) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: Missing x-user-id header" });
    return;
  }

  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // If preferences don't exist, we can return default values or a 404
      res.status(404).json({ error: "Preferences not found." });
      return;
    }
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/me/preferences - Update or create user preferences
router.put(
  "/me/preferences",
  validate(z.object({ body: updatePreferencesSchema })),
  async (req: Request<{}, Preferences, z.infer<typeof updatePreferencesSchema>>, res: Response<Preferences>) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Missing x-user-id header" });
      return;
    }

    try {
      // We use `upsert` to create preferences if they don't exist, or update them if they do.
      const updatedPreferences = await prisma.preferences.upsert({
        where: { userId },
        update: req.body,
        create: {
          userId,
          ...req.body,
        },
      });
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/me/stats - Retrieve user stats
router.get("/me/stats", async (req: Request, res: Response<UserStats>) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: Missing x-user-id header" });
    return;
  }

  try {
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    if (!stats) {
      res.json({
        booksRead: 0,
        pagesRead: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      return;
    }
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
