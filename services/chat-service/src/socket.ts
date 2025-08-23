import { Server } from "socket.io";
import { createServer } from "http";
import prisma from "./prisma.js";
import { createMessageSchema } from "./schemas.js";
import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const GROUP_SERVICE_URL = process.env.GROUP_SERVICE_URL || "http://localhost:3005";

export default function initializeSocket(httpServer: ReturnType<typeof createServer>) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // In production, restrict this to your frontend URL
    },
  });

  // Socket.io Authentication Middleware
  io.use(async (socket: any, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    try {
      const response = await axios.post(
        `${USER_SERVICE_URL}/api/auth/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.userId) {
        socket.userId = response.data.userId;
        next();
      } else {
        return next(new Error("Authentication error: Invalid token"));
      }
    } catch (error) {
      console.error("Socket Authentication Error: ", error);
      return next(new Error("Authentication error: Could not verify token"));
    }
  });

  io.on("connection", (socket: any) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on("join_group", (groupId: string) => {
      socket.join(groupId);
      console.log(`User ${socket.userId} joined group ${groupId}`);
    });

    socket.on("chat_message", async (data: { groupId: string; content: string }) => {
      const { groupId, content } = data;
      const senderId = socket.userId;

      const parseResult = createMessageSchema.safeParse({ groupId, content });
      if (!parseResult.success) {
        socket.emit("error", { message: "Invalid message format" });
        return;
      }

      try {
        // Verify that the user is a member of the group
        const memberResponse = await axios.get(
          `${GROUP_SERVICE_URL}/api/groups/${groupId}/members/${senderId}/verify`
        );

        if (memberResponse.status !== 200 || !memberResponse.data.isMember) {
          socket.emit("error", { message: "You are not a member of this group" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            groupId,
            senderId,
            content,
          },
        });

        io.to(groupId).emit("chat_message", message);
      } catch (error) {
        console.error("Error saving or broadcasting message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}
