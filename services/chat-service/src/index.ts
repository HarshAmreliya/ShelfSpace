import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import chatRoutes from "./routes/chat.routes.ts";
import initializeSocket from "./socket.ts";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.send("Hello from Chat Service!");
});

app.use("/api/chat", chatRoutes);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Chat service running at http://localhost:${PORT}`);
});
