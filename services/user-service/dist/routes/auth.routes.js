import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();
router.post("/verify", isAuthenticated, (req, res) => {
    res.status(200).json({ userId: req.userId });
});
export default router;
