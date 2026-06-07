import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// In-memory store for notifications
const notificationsStore = new Map<string, {
  id: string;
  userId: number;
  type: "message" | "call" | "group" | "story" | "system";
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}>();

export const notificationsRouter = router({
  // Send notification
  sendNotification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(["message", "call", "group", "story", "system"]),
        title: z.string(),
        body: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      notificationsStore.set(notificationId, {
        id: notificationId,
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        isRead: false,
        createdAt: new Date(),
      });

      // In production, send via push notification service
      console.log(`[Notification] Sent to user ${input.userId}: ${input.title}`);

      return { id: notificationId, success: true };
    }),

  // Get user notifications
  getUserNotifications: protectedProcedure
    .input(z.object({ limit: z.number().default(50), unreadOnly: z.boolean().default(false) }))
    .query(({ ctx, input }) => {
      const userNotifications = Array.from(notificationsStore.values())
        .filter((n) => n.userId === ctx.user.id)
        .filter((n) => !input.unreadOnly || !n.isRead)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);

      return userNotifications;
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = notificationsStore.get(input.notificationId);
      if (!notification) throw new Error("Notification not found");

      if (notification.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      notification.isRead = true;
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    let count = 0;
    for (const notification of notificationsStore.values()) {
      if (notification.userId === ctx.user.id && !notification.isRead) {
        notification.isRead = true;
        count++;
      }
    }
    return { success: true, markedCount: count };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = notificationsStore.get(input.notificationId);
      if (!notification) throw new Error("Notification not found");

      if (notification.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      notificationsStore.delete(input.notificationId);
      return { success: true };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(({ ctx }) => {
    let count = 0;
    for (const notification of notificationsStore.values()) {
      if (notification.userId === ctx.user.id && !notification.isRead) {
        count++;
      }
    }
    return { unreadCount: count };
  }),

  // Note: Subscriptions require additional setup with Socket.io or WebSocket
  // This is a placeholder for future implementation

  // Get notification by type
  getNotificationsByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(["message", "call", "group", "story", "system"]),
        limit: z.number().default(50),
      })
    )
    .query(({ ctx, input }) => {
      const notifications = Array.from(notificationsStore.values())
        .filter((n) => n.userId === ctx.user.id && n.type === input.type)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);

      return notifications;
    }),

  // Clear all notifications
  clearAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    const keysToDelete: string[] = [];
    for (const [key, notification] of notificationsStore.entries()) {
      if (notification.userId === ctx.user.id) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => notificationsStore.delete(key));
    return { success: true, deletedCount: keysToDelete.length };
  }),

  // Get notification stats
  getNotificationStats: protectedProcedure.query(({ ctx }) => {
    const userNotifications = Array.from(notificationsStore.values()).filter(
      (n) => n.userId === ctx.user.id
    );

    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter((n) => !n.isRead).length,
      byType: {
        message: userNotifications.filter((n) => n.type === "message").length,
        call: userNotifications.filter((n) => n.type === "call").length,
        group: userNotifications.filter((n) => n.type === "group").length,
        story: userNotifications.filter((n) => n.type === "story").length,
        system: userNotifications.filter((n) => n.type === "system").length,
      },
    };

    return stats;
  }),
});
