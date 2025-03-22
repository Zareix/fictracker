import { TRPCError } from "@trpc/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import { chapters, fanfics, progress } from "~/server/db/schema";
import { extractFanficData } from "~/server/services/extractor";

export const fanficRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db
      .select({
        id: fanfics.id,
        title: fanfics.title,
        url: fanfics.url,
        author: fanfics.author,
        website: fanfics.website,
        summary: fanfics.summary,
        likesCount: fanfics.likesCount,
        tags: fanfics.tags,
        isCompleted: fanfics.isCompleted,
        fandom: fanfics.fandom,
        ships: fanfics.ships,
        language: fanfics.language,
        progress: sql<number>`COALESCE(MAX(${progress.chapterNumber}), 0)`,
        chaptersCount: sql<number>`COALESCE(MAX(${chapters.number}), 0)`,
      })
      .from(fanfics)
      .leftJoin(progress, eq(fanfics.id, progress.fanficId))
      .leftJoin(chapters, eq(fanfics.id, chapters.fanficId))
      .groupBy(fanfics.id)
      .orderBy(asc(fanfics.title));
  }),
  extractData: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => extractFanficData(input)),
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string().url(),
        author: z.string(),
        website: z.string(),
        summary: z.string(),
        likesCount: z.number(),
        tags: z.array(z.string()),
        isCompleted: z.boolean(),
        fandom: z.array(z.string()),
        ships: z.array(z.string()),
        language: z.string(),
        chapters: z.array(
          z.object({
            number: z.number(),
            wordsCount: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const fanfic = await runTransaction(db, async () => {
        const fanficsReturned = await db
          .insert(fanfics)
          .values({
            title: input.title,
            url: input.url,
            author: input.author,
            website: input.website,
            summary: input.summary,
            likesCount: input.likesCount,
            tags: input.tags,
            isCompleted: input.isCompleted,
            fandom: input.fandom,
            ships: input.ships,
            language: input.language,
          })
          .returning({
            id: fanfics.id,
          });
        const fanfic = fanficsReturned[0];
        if (!fanfic) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error creating fanfic",
          });
        }
        await Promise.all(
          input.chapters.map(async (chapter) => {
            await db.insert(chapters).values({
              ...chapter,
              fanficId: fanfic.id,
            });
          }),
        );
        return fanfic;
      });

      return {
        id: fanfic.id,
      };
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        url: z.string().url(),
        author: z.string(),
        website: z.string(),
        summary: z.string(),
        likesCount: z.number(),
        tags: z.array(z.string()),
        isCompleted: z.boolean(),
        fandom: z.array(z.string()),
        ships: z.array(z.string()),
        language: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const fanfic = await runTransaction(db, async () => {
        const fanficsReturned = await db
          .update(fanfics)
          .set({
            title: input.title,
            url: input.url,
            author: input.author,
            website: input.website,
            summary: input.summary,
            likesCount: input.likesCount,
            tags: input.tags,
            isCompleted: input.isCompleted,
            fandom: input.fandom,
            ships: input.ships,
            language: input.language,
          })
          .where(eq(fanfics.id, input.id))
          .returning({
            id: fanfics.id,
          });

        const fanfic = fanficsReturned[0];
        if (!fanfic) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error creating fanfic",
          });
        }

        // TODO Handle chapters count update

        return fanfic;
      });

      return {
        id: fanfic.id,
      };
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    await runTransaction(db, async () => {
      // await db.delete(usersToFanfics).where(eq(usersToFanfics.fanficId, input));
      await db.delete(fanfics).where(eq(fanfics.id, input));
    });
  }),
});
