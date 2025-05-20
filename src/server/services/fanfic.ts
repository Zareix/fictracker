import { and, asc, eq, sql } from "drizzle-orm";
import type { DB } from "~/server/db";
import {
  chapters,
  fanfics,
  fanficsToShelves,
  progress,
} from "~/server/db/schema";

export const getAllFanfics = async (db: DB, shelfId?: number) => {
  const allFanfics = await db
    .select({
      id: fanfics.id,
      title: fanfics.title,
      url: fanfics.url,
      author: fanfics.author,
      website: fanfics.website,
      summary: fanfics.summary,
      likesCount: fanfics.likesCount,
      tags: fanfics.tags,
      rating: fanfics.rating,
      isCompleted: fanfics.isCompleted,
      fandom: fanfics.fandom,
      ships: fanfics.ships,
      language: fanfics.language,
      progress: sql<number>`COALESCE(MAX(${progress.chapterNumber}), 0)`,
      chaptersCount: sql<number>`COALESCE(MAX(${chapters.number}), 0)`,
      grade: fanfics.grade,
    })
    .from(fanfics)
    .leftJoin(progress, eq(fanfics.id, progress.fanficId))
    .leftJoin(chapters, eq(fanfics.id, chapters.fanficId))
    .leftJoin(fanficsToShelves, eq(fanfics.id, fanficsToShelves.fanficId))
    .groupBy(fanfics.id)
    .orderBy(asc(fanfics.title))
    .where(shelfId ? eq(fanficsToShelves.shelfId, shelfId) : undefined);

  const fanficsToShelvesData = await db.select().from(fanficsToShelves);

  return await Promise.all(
    allFanfics.map(async (fanfic) => ({
      ...fanfic,
      shelves: fanficsToShelvesData
        .filter((fanficToShelves) => fanficToShelves.fanficId === fanfic.id)
        .map((fanficToShelves) => fanficToShelves.shelfId),
      lastChapterUrl: await db
        .select()
        .from(chapters)
        .where(
          and(
            eq(chapters.fanficId, fanfic.id),
            eq(chapters.number, fanfic.progress + 1),
          ),
        )
        .then((chapters) => chapters[0]?.url),
    })),
  );
};
