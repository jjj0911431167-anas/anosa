import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getDb } from "../db";
import { directMessages, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface UserSocket {
  userId: number;
  socketId: string;
  status: "online" | "offline" | "away";
}

const connectedUsers = new Map<number, UserSocket>();
const typingUsers = new Map<string, { userId: number; recipientId: number; timeout: ReturnType<typeof setTimeout> }>();

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // User joins
    socket.on("user:join", async (userId: number) => {
      connectedUsers.set(userId, {
        userId,
        socketId: socket.id,
        status: "online",
      });

      // Update user status in database
      const db = await getDb();
      if (db) {
        await db.update(users).set({ status: "online", lastSeen: new Date() }).where(eq(users.id, userId));
      }

      // Broadcast user online status
      io.emit("user:status", {
        userId,
        status: "online",
        timestamp: new Date(),
      });

      console.log(`[Socket.io] User ${userId} is online`);
    });

    // Send message
    socket.on("message:send", async (data: { senderId: number; recipientId: number; content: string; messageType?: string }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Save message to database
        await db.insert(directMessages).values({
          senderId: data.senderId,
          recipientId: data.recipientId,
          content: data.content,
          messageType: (data.messageType || "text") as any,
          status: "sent",
        });

        const messageData = {
          id: Math.random(),
          senderId: data.senderId,
          recipientId: data.recipientId,
          content: data.content,
          messageType: data.messageType || "text",
          status: "sent",
          createdAt: new Date(),
        };

        // Send to recipient if online
        const recipient = connectedUsers.get(data.recipientId);
        if (recipient) {
          io.to(recipient.socketId).emit("message:receive", messageData);
        }

        // Emit delivery confirmation
        socket.emit("message:delivered", { success: true });

        console.log(`[Socket.io] Message sent from ${data.senderId} to ${data.recipientId}`);
      } catch (error) {
        console.error("[Socket.io] Error sending message:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    // Mark message as read
    socket.on("message:read", async (data: { messageId: number; userId: number }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(directMessages).set({ status: "read" }).where(eq(directMessages.id, data.messageId));

        io.emit("message:read", { messageId: data.messageId, userId: data.userId });
      } catch (error) {
        console.error("[Socket.io] Error marking message as read:", error);
      }
    });

    // Typing indicator
    socket.on("typing:start", (data: { senderId: number; recipientId: number }) => {
      const key = `${data.senderId}-${data.recipientId}`;

      // Clear existing timeout
      if (typingUsers.has(key)) {
        clearTimeout(typingUsers.get(key)!.timeout);
      }

      // Set new timeout to auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        typingUsers.delete(key);
        const recipient = connectedUsers.get(data.recipientId);
        if (recipient) {
          io.to(recipient.socketId).emit("typing:stop", { userId: data.senderId });
        }
      }, 3000);

      typingUsers.set(key, { userId: data.senderId, recipientId: data.recipientId, timeout });

      // Notify recipient
      const recipient = connectedUsers.get(data.recipientId);
      if (recipient) {
        io.to(recipient.socketId).emit("typing:start", { userId: data.senderId });
      }
    });

    // Stop typing
    socket.on("typing:stop", (data: { senderId: number; recipientId: number }) => {
      const key = `${data.senderId}-${data.recipientId}`;
      if (typingUsers.has(key)) {
        clearTimeout(typingUsers.get(key)!.timeout);
        typingUsers.delete(key);
      }

      const recipient = connectedUsers.get(data.recipientId);
      if (recipient) {
        io.to(recipient.socketId).emit("typing:stop", { userId: data.senderId });
      }
    });

    // Update user status
    socket.on("user:status", async (data: { userId: number; status: "online" | "offline" | "away" }) => {
      const user = connectedUsers.get(data.userId);
      if (user) {
        user.status = data.status;
      }

      const db = await getDb();
      if (db) {
        await db
          .update(users)
          .set({ status: data.status, lastSeen: new Date() })
          .where(eq(users.id, data.userId));
      }

      io.emit("user:status", {
        userId: data.userId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    // User disconnects
    socket.on("disconnect", async () => {
      // Find and remove user
      let disconnectedUserId: number | null = null;
      for (const [userId, userSocket] of connectedUsers.entries()) {
        if (userSocket.socketId === socket.id) {
          disconnectedUserId = userId;
          connectedUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        const db = await getDb();
        if (db) {
          await db
            .update(users)
            .set({ status: "offline", lastSeen: new Date() })
            .where(eq(users.id, disconnectedUserId));
        }

        io.emit("user:status", {
          userId: disconnectedUserId,
          status: "offline",
          timestamp: new Date(),
        });

        console.log(`[Socket.io] User ${disconnectedUserId} disconnected`);
      }
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error("[Socket.io] Socket error:", error);
    });
  });

  return io;
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

export function isUserOnline(userId: number) {
  return connectedUsers.has(userId);
}
