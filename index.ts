import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

// Store active connections
const activeUsers = new Map<string, string>(); // userId -> socketId
const userSockets = new Map<string, any>(); // socketId -> user info

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now(), activeUsers: activeUsers.size });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Socket.io Real-time Events
  io.on("connection", (socket) => {
    console.log(`[socket] User connected: ${socket.id}`);

    // User joins
    socket.on("user:join", (data) => {
      const { userId, userName } = data;
      activeUsers.set(userId, socket.id);
      userSockets.set(socket.id, { userId, userName });
      
      // Broadcast user online status
      io.emit("user:online", { userId, userName, timestamp: Date.now() });
      console.log(`[socket] User ${userId} joined`);
    });

    // Send message
    socket.on("message:send", (data) => {
      const { recipientId, message, messageId, senderId, senderName } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message:receive", {
          messageId,
          senderId,
          senderName,
          message,
          timestamp: Date.now(),
          status: "delivered",
        });
        
        // Send delivery confirmation
        socket.emit("message:delivered", { messageId, timestamp: Date.now() });
      } else {
        // User offline - store message
        socket.emit("message:offline", { messageId, recipientId });
      }
    });

    // Message read
    socket.on("message:read", (data) => {
      const { messageId, senderId } = data;
      const senderSocketId = activeUsers.get(senderId);
      
      if (senderSocketId) {
        io.to(senderSocketId).emit("message:read", { messageId, timestamp: Date.now() });
      }
    });

    // Typing indicator
    socket.on("typing:start", (data) => {
      const { recipientId, senderName } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing:start", { senderName });
      }
    });

    socket.on("typing:stop", (data) => {
      const { recipientId } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing:stop", {});
      }
    });

    // Call initiation
    socket.on("call:initiate", (data) => {
      const { recipientId, callerId, callerName, callType } = data; // callType: 'voice' or 'video'
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call:incoming", {
          callerId,
          callerName,
          callType,
          timestamp: Date.now(),
        });
      }
    });

    // Call answer
    socket.on("call:answer", (data) => {
      const { callerId, answererId } = data;
      const callerSocketId = activeUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("call:answered", {
          answererId,
          timestamp: Date.now(),
        });
      }
    });

    // Call reject
    socket.on("call:reject", (data) => {
      const { callerId } = data;
      const callerSocketId = activeUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("call:rejected", {
          timestamp: Date.now(),
        });
      }
    });

    // Call end
    socket.on("call:end", (data) => {
      const { otherUserId } = data;
      const otherSocketId = activeUsers.get(otherUserId);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit("call:ended", {
          timestamp: Date.now(),
        });
      }
    });

    // WebRTC offer
    socket.on("webrtc:offer", (data) => {
      const { recipientId, offer } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("webrtc:offer", { offer });
      }
    });

    // WebRTC answer
    socket.on("webrtc:answer", (data) => {
      const { callerId, answer } = data;
      const callerSocketId = activeUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("webrtc:answer", { answer });
      }
    });

    // ICE candidate
    socket.on("webrtc:ice", (data) => {
      const { recipientId, candidate } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("webrtc:ice", { candidate });
      }
    });

    // User disconnect
    socket.on("disconnect", () => {
      const userInfo = userSockets.get(socket.id);
      if (userInfo) {
        activeUsers.delete(userInfo.userId);
        io.emit("user:offline", { userId: userInfo.userId, timestamp: Date.now() });
        console.log(`[socket] User ${userInfo.userId} disconnected`);
      }
      userSockets.delete(socket.id);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`[socket] Error: ${error}`);
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
    console.log(`[socket.io] Real-time messaging and calls enabled`);
  });
}

startServer().catch(console.error);
