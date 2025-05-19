import { shelveRouter } from "~/server/api/routers/shelves";
import { fanficRouter } from "~/server/api/routers/fanfic";
import { progressRouter } from "~/server/api/routers/progress";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { statsRouter } from "~/server/api/routers/stats";

export const appRouter = createTRPCRouter({
  fanfic: fanficRouter,
  shelve: shelveRouter,
  progress: progressRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
