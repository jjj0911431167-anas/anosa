import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// In-memory store for stories (in production, use database)
const stories = new Map<string, {
  id: string;
  userId: number;
  content: string;
  mediaUrl?: string;
  mediaType: "text" | "image" | "video" | "audio";
  createdAt: Date;
  expiresAt: Date;
  viewedBy: number[];
}>();

export const storiesRouter = router({
  // Create a story
  createStory: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        mediaUrl: z.string().optional(),
        mediaType: z.enum(["text", "image", "video", "audio"]).default("text"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      stories.set(storyId, {
        id: storyId,
        userId: ctx.user.id,
        content: input.content,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        createdAt: now,
        expiresAt,
        viewedBy: [],
      });

      return {
        id: storyId,
        expiresAt,
      };
    }),

  // Get all stories (for feed)
  getStories: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const activeStories = Array.from(stories.values()).filter(
      (story) => story.expiresAt > now && story.userId !== ctx.user.id
    );

    return activeStories;
  }),

  // Get user's stories
  getUserStories: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const userStories = Array.from(stories.values()).filter(
        (story) => story.userId === input.userId && story.expiresAt > now
      );

      return userStories;
    }),

  // View a story
  viewStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const story = stories.get(input.storyId);
      if (!story) throw new Error("Story not found");

      if (!story.viewedBy.includes(ctx.user.id)) {
        story.viewedBy.push(ctx.user.id);
      }

      return { success: true, viewCount: story.viewedBy.length };
    }),

  // Delete a story
  deleteStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const story = stories.get(input.storyId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      stories.delete(input.storyId);
      return { success: true };
    }),

  // Get story viewers
  getStoryViewers: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const story = stories.get(input.storyId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return {
        viewCount: story.viewedBy.length,
        viewers: story.viewedBy,
      };
    }),

  // Get story by ID
  getStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(({ input }) => {
      const story = stories.get(input.storyId);
      return story || null;
    }),

  // Check if story exists and is not expired
  isStoryActive: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(({ input }) => {
      const story = stories.get(input.storyId);
      if (!story) return false;
      return story.expiresAt > new Date();
    }),

  // Get stories count for user
  getStoriesCount: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const now = new Date();
      const count = Array.from(stories.values()).filter(
        (story) => story.userId === input.userId && story.expiresAt > now
      ).length;

      return { count };
    }),
});
