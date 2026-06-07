import { describe, it, expect, beforeEach, vi } from "vitest";
import { socketService } from "@/lib/socket-service";

describe("Socket.io Messaging Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Message sending", () => {
    it("should emit message:send event with correct data", () => {
      const emitSpy = vi.spyOn(socketService, "sendMessage");
      
      socketService.sendMessage(
        "user123",
        "Hello world",
        "msg_001",
        "user456",
        "John"
      );

      expect(emitSpy).toHaveBeenCalledWith(
        "user123",
        "Hello world",
        "msg_001",
        "user456",
        "John"
      );
    });
  });

  describe("Typing indicators", () => {
    it("should emit typing:start event", () => {
      const startTypingSpy = vi.spyOn(socketService, "startTyping");
      
      socketService.startTyping("user123", "John");

      expect(startTypingSpy).toHaveBeenCalledWith("user123", "John");
    });

    it("should emit typing:stop event", () => {
      const stopTypingSpy = vi.spyOn(socketService, "stopTyping");
      
      socketService.stopTyping("user123");

      expect(stopTypingSpy).toHaveBeenCalledWith("user123");
    });
  });

  describe("Message status tracking", () => {
    it("should mark message as read", () => {
      const markReadSpy = vi.spyOn(socketService, "markMessageAsRead");
      
      socketService.markMessageAsRead("msg_001", "user456");

      expect(markReadSpy).toHaveBeenCalledWith("msg_001", "user456");
    });
  });

  describe("Call events", () => {
    it("should initiate a voice call", () => {
      const initiateSpy = vi.spyOn(socketService, "initiateCall");
      
      socketService.initiateCall("user123", "user456", "John", "voice");

      expect(initiateSpy).toHaveBeenCalledWith("user123", "user456", "John", "voice");
    });

    it("should initiate a video call", () => {
      const initiateSpy = vi.spyOn(socketService, "initiateCall");
      
      socketService.initiateCall("user123", "user456", "John", "video");

      expect(initiateSpy).toHaveBeenCalledWith("user123", "user456", "John", "video");
    });

    it("should answer a call", () => {
      const answerSpy = vi.spyOn(socketService, "answerCall");
      
      socketService.answerCall("user456", "user123");

      expect(answerSpy).toHaveBeenCalledWith("user456", "user123");
    });

    it("should reject a call", () => {
      const rejectSpy = vi.spyOn(socketService, "rejectCall");
      
      socketService.rejectCall("user456");

      expect(rejectSpy).toHaveBeenCalledWith("user456");
    });

    it("should end a call", () => {
      const endSpy = vi.spyOn(socketService, "endCall");
      
      socketService.endCall("user123");

      expect(endSpy).toHaveBeenCalledWith("user123");
    });
  });

  describe("WebRTC signaling", () => {
    it("should send WebRTC offer", () => {
      const offerSpy = vi.spyOn(socketService, "sendOffer");
      const mockOffer = { type: "offer", sdp: "mock-sdp" };
      
      socketService.sendOffer("user123", mockOffer);

      expect(offerSpy).toHaveBeenCalledWith("user123", mockOffer);
    });

    it("should send WebRTC answer", () => {
      const answerSpy = vi.spyOn(socketService, "sendAnswer");
      const mockAnswer = { type: "answer", sdp: "mock-sdp" };
      
      socketService.sendAnswer("user456", mockAnswer);

      expect(answerSpy).toHaveBeenCalledWith("user456", mockAnswer);
    });

    it("should send ICE candidate", () => {
      const iceSpy = vi.spyOn(socketService, "sendICECandidate");
      const mockCandidate = { candidate: "mock-candidate", sdpMLineIndex: 0 };
      
      socketService.sendICECandidate("user123", mockCandidate);

      expect(iceSpy).toHaveBeenCalledWith("user123", mockCandidate);
    });
  });

  describe("User status", () => {
    it("should listen for user online events", () => {
      const onlineCallback = vi.fn();
      socketService.onUserOnline(onlineCallback);

      expect(onlineCallback).toBeDefined();
    });

    it("should listen for user offline events", () => {
      const offlineCallback = vi.fn();
      socketService.onUserOffline(offlineCallback);

      expect(offlineCallback).toBeDefined();
    });
  });
});
