import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { directMessages, users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const messagesRouter = router({
  // Get conversation with a user
  getConversation: protectedProcedure
    .input(z.object({ userId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const msgs = await db
        .select()
        .from(directMessages)
        .where(
          and(
            or(
              and(eq(directMessages.senderId, ctx.user.id), eq(directMessages.recipientId, input.userId)),
              and(eq(directMessages.senderId, input.userId), eq(directMessages.recipientId, ctx.user.id))
            )
          )
        )
        .orderBy(desc(directMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return msgs.reverse();
    }),

  // Send a direct message
  sendMessage: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        content: z.string(),
        messageType: z.enum(["text", "image", "video", "audio", "file"]).default("text"),
        mediaUrl: z.string().optional(),
        mediaFileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(directMessages).values({
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        content: input.content,
        messageType: input.messageType,
        mediaUrl: input.mediaUrl,
        mediaFileName: input.mediaFileName,
        status: "sent",
      });

      return { success: true };
    }),

  // Mark message as delivered
  markDelivered: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(directMessages)
        .set({ status: "delivered" })
        .where(eq(directMessages.id, input.messageId));

      return { success: true };
    }),

  // Mark message as read
  markRead: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(directMessages)
        .set({ status: "read" })
        .where(eq(directMessages.id, input.messageId));

      return { success: true };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(directMessages)
        .set({ isDeleted: true, deletedAt: new Date() })
        .where(
          and(
            eq(directMessages.id, input.messageId),
            eq(directMessages.senderId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Edit a message
  editMessage: protectedProcedure
    .input(z.object({ messageId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(directMessages)
        .set({ content: input.content, isEdited: true, editedAt: new Date() })
        .where(
          and(
            eq(directMessages.id, input.messageId),
            eq(directMessages.senderId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Get recent conversations (list of users you've messaged)
  getRecentConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Get distinct users from recent messages
    const conversations = await db
      .select({
        userId: directMessages.senderId,
        lastMessage: directMessages.content,
        lastMessageTime: directMessages.createdAt,
      })
      .from(directMessages)
      .where(
        or(
          eq(directMessages.senderId, ctx.user.id),
          eq(directMessages.recipientId, ctx.user.id)
        )
      )
      .orderBy(desc(directMessages.createdAt))
      .limit(50);

    return conversations;
  }),
});

// Helper for or condition
function or(...conditions: any[]) {
  return conditions.reduce((acc, cond) => acc || cond);
}
