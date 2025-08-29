import express from "express";
import type { Request, Response } from "express";
import { isAuthenticated } from "../middlewares/auth.ts";

const router = express.Router();

router.post("/verify", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ userId: req.userId });
});

export default router;
