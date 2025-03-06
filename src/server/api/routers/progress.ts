import { eq, max, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { progress } from "~/server/db/schema";

export const progressRouter = createTRPCRouter({
  increment: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    const lastReadChapter = await db
      .select({
        chapterNumber: max(progress.chapterNumber),
      })
      .from(progress)
      .where(eq(progress.fanficId, input));
    await db.insert(progress).values({
      fanficId: input,
      chapterNumber: (lastReadChapter[0]?.chapterNumber ?? 0) + 1,
    });
  }),
});
