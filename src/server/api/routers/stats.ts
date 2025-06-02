import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAllFanfics } from "~/server/services/fanfic";
import { chapters, fanfics, progress } from "~/server/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { getUserFromSession } from "~/server/auth";

export const statsRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx: { session, db } }) => {
    const user = getUserFromSession(session);
    const allFanfics = await getAllFanfics(db, user.id);

    // All time
    let totalWordsRead = 0;
    for (const fanfic of allFanfics) {
      if (fanfic.progress > 0) {
        const chaptersRead = await db
          .select({ wordsCount: chapters.wordsCount })
          .from(chapters)
          .where(
            and(
              eq(chapters.fanficId, fanfic.id),
              lte(chapters.number, fanfic.progress),
            ),
          );
        totalWordsRead += chaptersRead.reduce(
          (sum, c) => sum + (c.wordsCount ?? 0),
          0,
        );
      }
    }

    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const progressThisMonth = await db
      .select({
        fanficId: progress.fanficId,
        chapterNumber: progress.chapterNumber,
        createdAt: progress.createdAt,
      })
      .from(progress)
      .innerJoin(fanfics, eq(fanfics.id, progress.fanficId))
      .where(
        and(gte(progress.createdAt, monthStart), eq(fanfics.userId, user.id)),
      );

    const completedFanficIds = new Set<number>();
    for (const p of progressThisMonth) {
      const fanfic = allFanfics.find((f) => f.id === p.fanficId);
      if (fanfic && fanfic.chaptersCount === p.chapterNumber) {
        completedFanficIds.add(p.fanficId);
      }
    }
    const totalCompletelyReadFanficThisMonth = completedFanficIds.size;

    let totalWordsReadThisMonth = 0;
    for (const p of progressThisMonth) {
      const chapter = await db
        .select({ wordsCount: chapters.wordsCount })
        .from(chapters)
        .where(
          and(
            eq(chapters.fanficId, p.fanficId),
            eq(chapters.number, p.chapterNumber),
          ),
        );
      if (chapter.length > 0) {
        totalWordsReadThisMonth += chapter[0]?.wordsCount ?? 0;
      }
    }

    return {
      allTime: {
        totalCompletelyReadFanfic: allFanfics.filter(
          (fanfic) => fanfic.chaptersCount === fanfic.progress,
        ).length,
        totalReadingFanfic: allFanfics.filter(
          (fanfic) =>
            fanfic.chaptersCount !== fanfic.progress && fanfic.progress > 0,
        ).length,
        totalNotStartedFanfic: allFanfics.filter(
          (fanfic) => fanfic.progress === 0,
        ).length,
        totalWordsRead,
      },
      thisMonth: {
        totalCompletelyReadFanfic: totalCompletelyReadFanficThisMonth,
        totalWordsRead: totalWordsReadThisMonth,
      },
    };
  }),
});
