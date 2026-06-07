import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, directMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next();
});

export const adminRouter = router({
  // Get all users
  getAllUsers: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return allUsers;
    }),

  // Get user details
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      return user[0] || null;
    }),

  // Block user
  blockUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(users).set({ isBlocked: true }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Unblock user
  unblockUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(users).set({ isBlocked: false }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Delete user
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Soft delete by marking as blocked
      await db.update(users).set({ isBlocked: true }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Get system statistics
  getSystemStats: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const totalUsers = await db.select().from(users);
    const blockedUsers = totalUsers.filter((u) => u.isBlocked).length;
    const activeUsers = totalUsers.filter((u) => u.status === "online").length;

    const totalMessages = await db.select().from(directMessages);

    return {
      totalUsers: totalUsers.length,
      blockedUsers,
      activeUsers,
      totalMessages: totalMessages.length,
      timestamp: new Date(),
    };
  }),

  // Get user activity
  getUserActivity: adminProcedure
    .input(z.object({ userId: z.number(), days: z.number().default(7) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const messages = await db
        .select()
        .from(directMessages)
        .where(
          and(
            eq(directMessages.senderId, input.userId),
            desc(directMessages.createdAt)
          )
        )
        .limit(100);

      return messages;
    }),

  // Search users
  searchUsers: adminProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // In production, use proper full-text search
      const allUsers = await db.select().from(users);
      return allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(input.query.toLowerCase()) ||
          u.phoneNumber.includes(input.query)
      );
    }),

  // Get message statistics
  getMessageStats: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const messages = await db.select().from(directMessages);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = messages.filter((m) => {
      const msgDate = new Date(m.createdAt);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() === today.getTime();
    });

    return {
      totalMessages: messages.length,
      todayMessages: todayMessages.length,
      averagePerDay: Math.round(messages.length / 30),
    };
  }),

  // Update user role
  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Get blocked users list
  getBlockedUsers: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const blocked = await db
        .select()
        .from(users)
        .where(eq(users.isBlocked, true))
        .limit(input.limit);

      return blocked;
    }),

  // Get recent activity log
  getActivityLog: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const messages = await db
        .select()
        .from(directMessages)
        .orderBy(desc(directMessages.createdAt))
        .limit(input.limit);

      return messages;
    }),
});
