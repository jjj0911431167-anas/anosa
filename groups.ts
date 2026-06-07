import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { groups, groupMembers, groupMessages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// In-memory store for groups (in production, use database)
const groupsStore = new Map<string, {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  members: number[];
  createdAt: Date;
  profilePictureUrl?: string;
}>();

export const groupsRouter = router({
  // Create a group
  createGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        memberIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const members = [ctx.user.id, ...(input.memberIds || [])];

      groupsStore.set(groupId, {
        id: groupId,
        name: input.name,
        description: input.description || "",
        ownerId: ctx.user.id,
        members: [...new Set(members)],
        createdAt: new Date(),
      });

      return {
        id: groupId,
        name: input.name,
        members: members.length,
      };
    }),

  // Get user's groups
  getUserGroups: protectedProcedure.query(async ({ ctx }) => {
    const userGroups = Array.from(groupsStore.values()).filter((g) =>
      g.members.includes(ctx.user.id)
    );

    return userGroups;
  }),

  // Get group details
  getGroupDetails: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(({ input }) => {
      const group = groupsStore.get(input.groupId);
      return group || null;
    }),

  // Add member to group
  addMember: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (group.ownerId !== ctx.user.id) {
        throw new Error("Only group owner can add members");
      }

      if (!group.members.includes(input.userId)) {
        group.members.push(input.userId);
      }

      return { success: true };
    }),

  // Remove member from group
  removeMember: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (group.ownerId !== ctx.user.id && input.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      group.members = group.members.filter((id) => id !== input.userId);
      return { success: true };
    }),

  // Send group message
  sendGroupMessage: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        content: z.string(),
        messageType: z.enum(["text", "image", "video", "audio", "file"]).default("text"),
        mediaUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (!group.members.includes(ctx.user.id)) {
        throw new Error("Not a member of this group");
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: messageId,
        groupId: input.groupId,
        senderId: ctx.user.id,
        content: input.content,
        messageType: input.messageType,
        createdAt: new Date(),
      };
    }),

  // Get group messages
  getGroupMessages: protectedProcedure
    .input(z.object({ groupId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (!group.members.includes(ctx.user.id)) {
        throw new Error("Not a member of this group");
      }

      // In production, query from database
      return [];
    }),

  // Update group info
  updateGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (group.ownerId !== ctx.user.id) {
        throw new Error("Only group owner can update group");
      }

      if (input.name) group.name = input.name;
      if (input.description) group.description = input.description;
      if (input.profilePictureUrl) group.profilePictureUrl = input.profilePictureUrl;

      return { success: true };
    }),

  // Delete group
  deleteGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      if (group.ownerId !== ctx.user.id) {
        throw new Error("Only group owner can delete group");
      }

      groupsStore.delete(input.groupId);
      return { success: true };
    }),

  // Leave group
  leaveGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) throw new Error("Group not found");

      group.members = group.members.filter((id) => id !== ctx.user.id);

      // If owner leaves and no members, delete group
      if (group.members.length === 0) {
        groupsStore.delete(input.groupId);
      }

      return { success: true };
    }),

  // Get group members
  getGroupMembers: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(({ input }) => {
      const group = groupsStore.get(input.groupId);
      if (!group) return [];

      return group.members;
    }),

  // Search groups
  searchGroups: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const results = Array.from(groupsStore.values()).filter(
        (g) =>
          g.name.toLowerCase().includes(input.query.toLowerCase()) ||
          g.description.toLowerCase().includes(input.query.toLowerCase())
      );

      return results;
    }),
});
