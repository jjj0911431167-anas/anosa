import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// In-memory store for active calls (in production, use Redis)
const activeCalls = new Map<string, {
  id: string;
  callerId: number;
  recipientId: number;
  type: "audio" | "video";
  status: "ringing" | "active" | "ended";
  startedAt: Date;
  sdpOffer?: string;
  sdpAnswer?: string;
}>();

export const callsRouter = router({
  // Initiate a call
  initiateCall: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        callType: z.enum(["audio", "video"]),
        sdpOffer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      activeCalls.set(callId, {
        id: callId,
        callerId: ctx.user.id,
        recipientId: input.recipientId,
        type: input.callType,
        status: "ringing",
        startedAt: new Date(),
        sdpOffer: input.sdpOffer,
      });

      // In production, emit event via Socket.io
      return {
        callId,
        status: "ringing",
      };
    }),

  // Answer a call
  answerCall: protectedProcedure
    .input(
      z.object({
        callId: z.string(),
        sdpAnswer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const call = activeCalls.get(input.callId);
      if (!call) throw new Error("Call not found");

      call.status = "active";
      call.sdpAnswer = input.sdpAnswer;

      return { success: true, callId: input.callId };
    }),

  // Reject a call
  rejectCall: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      activeCalls.delete(input.callId);
      return { success: true };
    }),

  // End a call
  endCall: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      activeCalls.delete(input.callId);
      return { success: true };
    }),

  // Get call info
  getCallInfo: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .query(({ input }) => {
      const call = activeCalls.get(input.callId);
      if (!call) return null;
      return call;
    }),

  // Get active calls for user
  getActiveCalls: protectedProcedure.query(({ ctx }) => {
    const userCalls = Array.from(activeCalls.values()).filter(
      (call) => call.callerId === ctx.user.id || call.recipientId === ctx.user.id
    );
    return userCalls;
  }),

  // Add ICE candidate
  addIceCandidate: protectedProcedure
    .input(
      z.object({
        callId: z.string(),
        candidate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, store or relay ICE candidates
      return { success: true };
    }),

  // Update call status
  updateCallStatus: protectedProcedure
    .input(
      z.object({
        callId: z.string(),
        status: z.enum(["ringing", "active", "ended"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const call = activeCalls.get(input.callId);
      if (!call) throw new Error("Call not found");

      call.status = input.status;
      return { success: true };
    }),

  // Get call history
  getCallHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      // In production, query from database
      return [];
    }),
});
