import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { messagesRouter } from "./routers/messages";
import { callsRouter } from "./routers/calls";
import { storiesRouter } from "./routers/stories";
import { aiRouter } from "./routers/ai";
import { adminRouter } from "./routers/admin";
import { groupsRouter } from "./routers/groups";
import { channelsRouter } from "./routers/channels";
import { notificationsRouter } from "./routers/notifications";
import { uploadRouter } from "./routers/upload";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  messages: messagesRouter,
  calls: callsRouter,
  stories: storiesRouter,
  ai: aiRouter,
  admin: adminRouter,
  groups: groupsRouter,
  channels: channelsRouter,
  notifications: notificationsRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
