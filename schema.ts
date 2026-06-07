import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table for authentication and user management.
 * Supports phone-based registration and OAuth.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).unique(),
    phoneNumber: varchar("phoneNumber", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    bio: text("bio"),
    profilePictureUrl: text("profilePictureUrl"),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    status: mysqlEnum("status", ["online", "offline", "away"]).default("offline").notNull(),
    lastSeen: timestamp("lastSeen").defaultNow().notNull(),
    isBlocked: boolean("isBlocked").default(false).notNull(),
    privacySettings: json("privacySettings").$type<{
      whoCanMessage: "everyone" | "friends" | "nobody";
      whoCanSeeStatus: "everyone" | "friends" | "nobody";
      hideLastSeen: boolean;
    }>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("phoneIdx").on(table.phoneNumber),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OTP verification table for phone-based authentication.
 */
export const otpVerifications = mysqlTable(
  "otpVerifications",
  {
    id: int("id").autoincrement().primaryKey(),
    phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
    otp: varchar("otp", { length: 6 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    attempts: int("attempts").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("phoneIdx").on(table.phoneNumber),
  })
);

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

/**
 * Direct messages between users.
 */
export const directMessages = mysqlTable(
  "directMessages",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    senderId: int("senderId").notNull(),
    recipientId: int("recipientId").notNull(),
    content: text("content"),
    messageType: mysqlEnum("messageType", [
      "text",
      "image",
      "video",
      "audio",
      "file",
    ]).default("text").notNull(),
    mediaUrl: text("mediaUrl"),
    mediaFileName: varchar("mediaFileName", { length: 255 }),
    mediaMimeType: varchar("mediaMimeType", { length: 100 }),
    mediaSize: int("mediaSize"),
    status: mysqlEnum("status", ["sent", "delivered", "read"]).default("sent").notNull(),
    replyToId: bigint("replyToId", { mode: "number" }),
    isForwarded: boolean("isForwarded").default(false).notNull(),
    disappearsAt: timestamp("disappearsAt"),
    isEdited: boolean("isEdited").default(false).notNull(),
    editedAt: timestamp("editedAt"),
    isDeleted: boolean("isDeleted").default(false).notNull(),
    deletedAt: timestamp("deletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    senderIdx: index("senderIdx").on(table.senderId),
    recipientIdx: index("recipientIdx").on(table.recipientId),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

/**
 * Message read receipts for tracking when messages are read.
 */
export const messageReadReceipts = mysqlTable(
  "messageReadReceipts",
  {
    id: int("id").autoincrement().primaryKey(),
    messageId: bigint("messageId", { mode: "number" }).notNull(),
    userId: int("userId").notNull(),
    readAt: timestamp("readAt").defaultNow().notNull(),
  },
  (table) => ({
    messageIdx: index("messageIdx").on(table.messageId),
    userIdx: index("userIdx").on(table.userId),
  })
);

export type MessageReadReceipt = typeof messageReadReceipts.$inferSelect;
export type InsertMessageReadReceipt = typeof messageReadReceipts.$inferInsert;

/**
 * Groups for multi-user conversations.
 */
export const groups = mysqlTable(
  "groups",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    profilePictureUrl: text("profilePictureUrl"),
    ownerId: int("ownerId").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    maxMembers: int("maxMembers").default(1000).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("ownerIdx").on(table.ownerId),
    isPublicIdx: index("isPublicIdx").on(table.isPublic),
  })
);

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group members with roles.
 */
export const groupMembers = mysqlTable(
  "groupMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    groupId: int("groupId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    groupIdx: index("groupIdx").on(table.groupId),
    userIdx: index("userIdx").on(table.userId),
  })
);

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * Group messages.
 */
export const groupMessages = mysqlTable(
  "groupMessages",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    groupId: int("groupId").notNull(),
    senderId: int("senderId").notNull(),
    content: text("content"),
    messageType: mysqlEnum("messageType", [
      "text",
      "image",
      "video",
      "audio",
      "file",
    ]).default("text").notNull(),
    mediaUrl: text("mediaUrl"),
    mediaFileName: varchar("mediaFileName", { length: 255 }),
    mediaMimeType: varchar("mediaMimeType", { length: 100 }),
    mediaSize: int("mediaSize"),
    replyToId: bigint("replyToId", { mode: "number" }),
    isForwarded: boolean("isForwarded").default(false).notNull(),
    isEdited: boolean("isEdited").default(false).notNull(),
    editedAt: timestamp("editedAt"),
    isDeleted: boolean("isDeleted").default(false).notNull(),
    deletedAt: timestamp("deletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    groupIdx: index("groupIdx").on(table.groupId),
    senderIdx: index("senderIdx").on(table.senderId),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = typeof groupMessages.$inferInsert;

/**
 * Broadcast channels (like Telegram channels).
 */
export const channels = mysqlTable(
  "channels",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    profilePictureUrl: text("profilePictureUrl"),
    ownerId: int("ownerId").notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("ownerIdx").on(table.ownerId),
    isPublicIdx: index("isPublicIdx").on(table.isPublic),
  })
);

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;

/**
 * Channel subscribers.
 */
export const channelSubscribers = mysqlTable(
  "channelSubscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    channelId: int("channelId").notNull(),
    userId: int("userId").notNull(),
    subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  },
  (table) => ({
    channelIdx: index("channelIdx").on(table.channelId),
    userIdx: index("userIdx").on(table.userId),
  })
);

export type ChannelSubscriber = typeof channelSubscribers.$inferSelect;
export type InsertChannelSubscriber = typeof channelSubscribers.$inferInsert;

/**
 * Channel posts.
 */
export const channelPosts = mysqlTable(
  "channelPosts",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    channelId: int("channelId").notNull(),
    authorId: int("authorId").notNull(),
    content: text("content"),
    mediaUrl: text("mediaUrl"),
    mediaFileName: varchar("mediaFileName", { length: 255 }),
    mediaMimeType: varchar("mediaMimeType", { length: 100 }),
    mediaSize: int("mediaSize"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    channelIdx: index("channelIdx").on(table.channelId),
    authorIdx: index("authorIdx").on(table.authorId),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type ChannelPost = typeof channelPosts.$inferSelect;
export type InsertChannelPost = typeof channelPosts.$inferInsert;

/**
 * User stories/status (disappears after 24 hours).
 */
export const stories = mysqlTable(
  "stories",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    content: text("content"),
    mediaUrl: text("mediaUrl"),
    mediaType: mysqlEnum("mediaType", ["image", "video", "text", "audio"]).default("image").notNull(),
    mediaFileName: varchar("mediaFileName", { length: 255 }),
    mediaMimeType: varchar("mediaMimeType", { length: 100 }),
    mediaSize: int("mediaSize"),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    expiresAtIdx: index("expiresAtIdx").on(table.expiresAt),
  })
);

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Story views tracking.
 */
export const storyViews = mysqlTable(
  "storyViews",
  {
    id: int("id").autoincrement().primaryKey(),
    storyId: int("storyId").notNull(),
    viewerId: int("viewerId").notNull(),
    viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  },
  (table) => ({
    storyIdx: index("storyIdx").on(table.storyId),
    viewerIdx: index("viewerIdx").on(table.viewerId),
  })
);

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

/**
 * Story replies (private messages sent as replies to stories).
 */
export const storyReplies = mysqlTable(
  "storyReplies",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    storyId: int("storyId").notNull(),
    senderId: int("senderId").notNull(),
    content: text("content"),
    mediaUrl: text("mediaUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    storyIdx: index("storyIdx").on(table.storyId),
    senderIdx: index("senderIdx").on(table.senderId),
  })
);

export type StoryReply = typeof storyReplies.$inferSelect;
export type InsertStoryReply = typeof storyReplies.$inferInsert;

/**
 * User blocking.
 */
export const blockedUsers = mysqlTable(
  "blockedUsers",
  {
    id: int("id").autoincrement().primaryKey(),
    blockerId: int("blockerId").notNull(),
    blockedId: int("blockedId").notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    blockerIdx: index("blockerIdx").on(table.blockerId),
    blockedIdx: index("blockedIdx").on(table.blockedId),
  })
);

export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertBlockedUser = typeof blockedUsers.$inferInsert;

/**
 * User reports for content moderation.
 */
export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reporterId: int("reporterId").notNull(),
    reportedUserId: int("reportedUserId"),
    reportedMessageId: bigint("reportedMessageId", { mode: "number" }),
    reportedStoryId: int("reportedStoryId"),
    reason: mysqlEnum("reason", ["abuse", "spam", "inappropriate", "other"]).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
    actionTaken: text("actionTaken"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    reporterIdx: index("reporterIdx").on(table.reporterId),
    statusIdx: index("statusIdx").on(table.status),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Call history tracking.
 */
export const callHistory = mysqlTable(
  "callHistory",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    callerId: int("callerId").notNull(),
    recipientId: int("recipientId").notNull(),
    callType: mysqlEnum("callType", ["audio", "video"]).default("audio").notNull(),
    status: mysqlEnum("status", ["missed", "completed", "rejected"]).default("missed").notNull(),
    duration: int("duration").default(0).notNull(),
    startedAt: timestamp("startedAt").notNull(),
    endedAt: timestamp("endedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    callerIdx: index("callerIdx").on(table.callerId),
    recipientIdx: index("recipientIdx").on(table.recipientId),
    startedAtIdx: index("startedAtIdx").on(table.startedAt),
  })
);

export type CallHistory = typeof callHistory.$inferSelect;
export type InsertCallHistory = typeof callHistory.$inferInsert;

/**
 * Events and scheduled meetings.
 */
export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startTime: timestamp("startTime").notNull(),
    endTime: timestamp("endTime").notNull(),
    location: varchar("location", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("creatorIdx").on(table.creatorId),
    startTimeIdx: index("startTimeIdx").on(table.startTime),
  })
);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event attendees and their RSVP status.
 */
export const eventAttendees = mysqlTable(
  "eventAttendees",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: int("eventId").notNull(),
    userId: int("userId").notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
    respondedAt: timestamp("respondedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("eventIdx").on(table.eventId),
    userIdx: index("userIdx").on(table.userId),
  })
);

export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = typeof eventAttendees.$inferInsert;

/**
 * User contacts/friends list.
 */
export const contacts = mysqlTable(
  "contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    contactId: int("contactId").notNull(),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    contactIdx: index("contactIdx").on(table.contactId),
  })
);

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * System activity logs for admin monitoring.
 */
export const activityLogs = mysqlTable(
  "activityLogs",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    userId: int("userId"),
    action: varchar("action", { length: 100 }).notNull(),
    details: json("details"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    actionIdx: index("actionIdx").on(table.action),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
