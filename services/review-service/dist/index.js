import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import reviewRoutes from "./routes/review.routes.js";
import prisma from "./prisma.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3002;
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request ID + structured request logging
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = req.headers["x-request-id"] || randomUUID();
    res.setHeader("x-request-id", requestId);
    req.requestId = requestId;
    console.log(JSON.stringify({
        level: "info",
        msg: "request:start",
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    }));
    res.on("finish", () => {
        console.log(JSON.stringify({
            level: "info",
            msg: "request:finish",
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
        }));
    });
    next();
});
app.use("/reviews", reviewRoutes);
app.get("/", (req, res) => {
    res.send("Review service is running!");
});
app.get("/health", async (_req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ok", service: "review-service" });
    }
    catch (error) {
        res.status(503).json({ status: "error", service: "review-service", error: "Database connection failed" });
    }
});
app.listen(port, () => {
    console.log(`Review service listening on port ${port}`);
});
