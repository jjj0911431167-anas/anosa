import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

export const socketService = {
  async connect(userId: string, userName: string) {
    if (socket?.connected) return socket;

    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
    
    socket = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[socket] Connected");
      socket?.emit("user:join", { userId, userName });
    });

    socket.on("disconnect", () => {
      console.log("[socket] Disconnected");
    });

    socket.on("error", (error) => {
      console.error("[socket] Error:", error);
    });

    return socket;
  },

  disconnect() {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket() {
    return socket;
  },

  // Message events
  sendMessage(recipientId: string, message: string, messageId: string, senderId: string, senderName: string) {
    socket?.emit("message:send", {
      recipientId,
      message,
      messageId,
      senderId,
      senderName,
    });
  },

  onMessageReceive(callback: (data: any) => void) {
    socket?.on("message:receive", callback);
  },

  onMessageDelivered(callback: (data: any) => void) {
    socket?.on("message:delivered", callback);
  },

  onMessageRead(callback: (data: any) => void) {
    socket?.on("message:read", callback);
  },

  markMessageAsRead(messageId: string, senderId: string) {
    socket?.emit("message:read", { messageId, senderId });
  },

  // Typing indicators
  startTyping(recipientId: string, senderName: string) {
    socket?.emit("typing:start", { recipientId, senderName });
  },

  stopTyping(recipientId: string) {
    socket?.emit("typing:stop", { recipientId });
  },

  onTypingStart(callback: (data: any) => void) {
    socket?.on("typing:start", callback);
  },

  onTypingStop(callback: (data: any) => void) {
    socket?.on("typing:stop", callback);
  },

  // Call events
  initiateCall(recipientId: string, callerId: string, callerName: string, callType: "voice" | "video") {
    socket?.emit("call:initiate", {
      recipientId,
      callerId,
      callerName,
      callType,
    });
  },

  onIncomingCall(callback: (data: any) => void) {
    socket?.on("call:incoming", callback);
  },

  answerCall(callerId: string, answererId: string) {
    socket?.emit("call:answer", { callerId, answererId });
  },

  onCallAnswered(callback: (data: any) => void) {
    socket?.on("call:answered", callback);
  },

  rejectCall(callerId: string) {
    socket?.emit("call:reject", { callerId });
  },

  onCallRejected(callback: (data: any) => void) {
    socket?.on("call:rejected", callback);
  },

  endCall(otherUserId: string) {
    socket?.emit("call:end", { otherUserId });
  },

  onCallEnded(callback: (data: any) => void) {
    socket?.on("call:ended", callback);
  },

  // WebRTC events
  sendOffer(recipientId: string, offer: any) {
    socket?.emit("webrtc:offer", { recipientId, offer });
  },

  onOffer(callback: (data: any) => void) {
    socket?.on("webrtc:offer", callback);
  },

  sendAnswer(callerId: string, answer: any) {
    socket?.emit("webrtc:answer", { callerId, answer });
  },

  onAnswer(callback: (data: any) => void) {
    socket?.on("webrtc:answer", callback);
  },

  sendICECandidate(recipientId: string, candidate: any) {
    socket?.emit("webrtc:ice", { recipientId, candidate });
  },

  onICECandidate(callback: (data: any) => void) {
    socket?.on("webrtc:ice", callback);
  },

  // User status
  onUserOnline(callback: (data: any) => void) {
    socket?.on("user:online", callback);
  },

  onUserOffline(callback: (data: any) => void) {
    socket?.on("user:offline", callback);
  },

  // Cleanup
  removeAllListeners() {
    socket?.removeAllListeners();
  },
};
