import { and, eq, max } from "drizzle-orm";
import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUserFromSession } from "~/server/auth";
import { db, runTransaction } from "~/server/db";
import { chapters, progress } from "~/server/db/schema";
import { checkIsUserFanfic } from "~/server/services/fanfic";

export const progressRouter = createTRPCRouter({
  markAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const fanficId = input;
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, fanficId);

      const maxChapter = (
        await ctx.db
          .select({
            maxChapter: max(chapters.number),
          })
          .from(chapters)
          .where(eq(chapters.fanficId, fanficId))
      )[0]?.maxChapter;
      if (!maxChapter) {
        throw new Error("Fanfic not found");
      }

      const lastReadChapter =
        (
          await ctx.db
            .select({
              chapterNumber: max(progress.chapterNumber),
            })
            .from(progress)
            .where(eq(progress.fanficId, fanficId))
        )[0]?.chapterNumber ?? 0;
      if (lastReadChapter === maxChapter) {
        return;
      }
      await runTransaction(ctx.db, async () => {
        for (let i = lastReadChapter + 1; i <= maxChapter; i++) {
          await ctx.db.insert(progress).values({ fanficId, chapterNumber: i });
        }
      });
    }),
  increment: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input);

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
  decrement: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input);

      const lastReadChapter = await db
        .select({
          chapterNumber: max(progress.chapterNumber),
        })
        .from(progress)
        .where(eq(progress.fanficId, input));
      await db
        .delete(progress)
        .where(
          and(
            eq(progress.fanficId, input),
            eq(progress.chapterNumber, lastReadChapter[0]?.chapterNumber ?? 0),
          ),
        );
    }),
});
