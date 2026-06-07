import { io, Socket } from "socket.io-client";

export interface SocketMessage {
  id: string;
  chatId: string;
  senderId: number;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio" | "file";
  status: "sending" | "sent" | "delivered" | "read";
  createdAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

export interface UserPresence {
  userId: number;
  username: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
}

export interface TypingIndicator {
  chatId: string;
  userId: number;
  username: string;
  isTyping: boolean;
}

class SocketClient {
  private socket: Socket | null = null;
  private serverUrl: string = "http://localhost:3000";
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
          console.log("Socket connected");
          this.emit("connected");
          resolve();
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
          this.emit("disconnected");
        });

        this.socket.on("error", (error: any) => {
          console.error("Socket error:", error);
          reject(error);
        });

        // Message events
        this.socket.on("message:new", (message: SocketMessage) => {
          this.emit("message:new", message);
        });

        this.socket.on("message:edited", (message: SocketMessage) => {
          this.emit("message:edited", message);
        });

        this.socket.on("message:deleted", (data: { messageId: string }) => {
          this.emit("message:deleted", data);
        });

        this.socket.on("message:status", (data: { messageId: string; status: string }) => {
          this.emit("message:status", data);
        });

        // Presence events
        this.socket.on("user:online", (user: UserPresence) => {
          this.emit("user:online", user);
        });

        this.socket.on("user:offline", (user: UserPresence) => {
          this.emit("user:offline", user);
        });

        this.socket.on("user:typing", (data: TypingIndicator) => {
          this.emit("user:typing", data);
        });

        // Call events
        this.socket.on("call:incoming", (data: any) => {
          this.emit("call:incoming", data);
        });

        this.socket.on("call:answered", (data: any) => {
          this.emit("call:answered", data);
        });

        this.socket.on("call:rejected", (data: any) => {
          this.emit("call:rejected", data);
        });

        this.socket.on("call:ended", (data: any) => {
          this.emit("call:ended", data);
        });

        // Notification events
        this.socket.on("notification:new", (data: any) => {
          this.emit("notification:new", data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(chatId: string, text: string, mediaUrl?: string): void {
    if (this.socket) {
      this.socket.emit("message:send", {
        chatId,
        text,
        mediaUrl,
        timestamp: new Date(),
      });
    }
  }

  editMessage(messageId: string, text: string): void {
    if (this.socket) {
      this.socket.emit("message:edit", {
        messageId,
        text,
        timestamp: new Date(),
      });
    }
  }

  deleteMessage(messageId: string): void {
    if (this.socket) {
      this.socket.emit("message:delete", { messageId });
    }
  }

  markMessageAsRead(messageId: string): void {
    if (this.socket) {
      this.socket.emit("message:read", { messageId });
    }
  }

  setTyping(chatId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit("user:typing", {
        chatId,
        isTyping,
        timestamp: new Date(),
      });
    }
  }

  setPresence(status: "online" | "offline" | "away"): void {
    if (this.socket) {
      this.socket.emit("user:presence", {
        status,
        timestamp: new Date(),
      });
    }
  }

  initiateCall(targetUserId: number, callType: "voice" | "video"): void {
    if (this.socket) {
      this.socket.emit("call:initiate", {
        targetUserId,
        callType,
        timestamp: new Date(),
      });
    }
  }

  answerCall(callId: string): void {
    if (this.socket) {
      this.socket.emit("call:answer", { callId });
    }
  }

  rejectCall(callId: string): void {
    if (this.socket) {
      this.socket.emit("call:reject", { callId });
    }
  }

  endCall(callId: string): void {
    if (this.socket) {
      this.socket.emit("call:end", { callId });
    }
  }

  sendWebRTCSignal(targetUserId: number, signal: any): void {
    if (this.socket) {
      this.socket.emit("webrtc:signal", {
        targetUserId,
        signal,
      });
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
