import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// In-memory store for channels
const channelsStore = new Map<string, {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  subscribers: number[];
  createdAt: Date;
  profilePictureUrl?: string;
  isPrivate: boolean;
}>();

export const channelsRouter = router({
  // Create a channel
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      channelsStore.set(channelId, {
        id: channelId,
        name: input.name,
        description: input.description || "",
        ownerId: ctx.user.id,
        subscribers: [ctx.user.id],
        createdAt: new Date(),
        isPrivate: input.isPrivate,
      });

      return {
        id: channelId,
        name: input.name,
      };
    }),

  // Get all public channels
  getPublicChannels: protectedProcedure.query(() => {
    const publicChannels = Array.from(channelsStore.values()).filter((c) => !c.isPrivate);
    return publicChannels;
  }),

  // Get user's subscribed channels
  getUserChannels: protectedProcedure.query(async ({ ctx }) => {
    const userChannels = Array.from(channelsStore.values()).filter((c) =>
      c.subscribers.includes(ctx.user.id)
    );
    return userChannels;
  }),

  // Get channel details
  getChannelDetails: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      const channel = channelsStore.get(input.channelId);
      return channel || null;
    }),

  // Subscribe to channel
  subscribeChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.isPrivate && channel.ownerId !== ctx.user.id) {
        throw new Error("Cannot subscribe to private channel");
      }

      if (!channel.subscribers.includes(ctx.user.id)) {
        channel.subscribers.push(ctx.user.id);
      }

      return { success: true, subscriberCount: channel.subscribers.length };
    }),

  // Unsubscribe from channel
  unsubscribeChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      channel.subscribers = channel.subscribers.filter((id) => id !== ctx.user.id);

      return { success: true, subscriberCount: channel.subscribers.length };
    }),

  // Post to channel (owner only)
  postToChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string(),
        mediaUrl: z.string().optional(),
        mediaType: z.enum(["text", "image", "video", "audio"]).default("text"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.ownerId !== ctx.user.id) {
        throw new Error("Only channel owner can post");
      }

      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: postId,
        channelId: input.channelId,
        content: input.content,
        mediaType: input.mediaType,
        createdAt: new Date(),
      };
    }),

  // Get channel posts
  getChannelPosts: protectedProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      // In production, query from database
      return [];
    }),

  // Update channel info (owner only)
  updateChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.ownerId !== ctx.user.id) {
        throw new Error("Only channel owner can update channel");
      }

      if (input.name) channel.name = input.name;
      if (input.description) channel.description = input.description;
      if (input.profilePictureUrl) channel.profilePictureUrl = input.profilePictureUrl;

      return { success: true };
    }),

  // Delete channel (owner only)
  deleteChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.ownerId !== ctx.user.id) {
        throw new Error("Only channel owner can delete channel");
      }

      channelsStore.delete(input.channelId);
      return { success: true };
    }),

  // Search channels
  searchChannels: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const results = Array.from(channelsStore.values())
        .filter((c) => !c.isPrivate)
        .filter(
          (c) =>
            c.name.toLowerCase().includes(input.query.toLowerCase()) ||
            c.description.toLowerCase().includes(input.query.toLowerCase())
        );

      return results;
    }),

  // Get channel subscribers count
  getSubscriberCount: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      const channel = channelsStore.get(input.channelId);
      return { count: channel?.subscribers.length || 0 };
    }),

  // Check if user is subscribed
  isSubscribed: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ ctx, input }) => {
      const channel = channelsStore.get(input.channelId);
      return { isSubscribed: channel?.subscribers.includes(ctx.user.id) || false };
    }),
});
