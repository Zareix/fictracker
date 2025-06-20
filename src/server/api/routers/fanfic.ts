import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { Ratings } from "~/lib/constant";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUserFromSession } from "~/server/auth";
import { runTransaction } from "~/server/db";
import { chapters, fanfics, fanficsToShelves } from "~/server/db/schema";
import {
  extractFanficChapters,
  extractFanficData,
} from "~/server/services/extractor";
import { checkIsUserFanfic, getAllFanfics } from "~/server/services/fanfic";

export const fanficRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = getUserFromSession(ctx.session);
    return getAllFanfics(ctx.db, user.id);
  }),
  extractData: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => extractFanficData(input)),
  extractChapters: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => extractFanficChapters(input)),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.url().nullish(),
        author: z.string(),
        website: z.string(),
        summary: z.string(),
        likesCount: z.number(),
        tags: z.array(z.string()),
        isCompleted: z.boolean(),
        fandom: z.array(z.string()),
        ships: z.array(z.string()),
        rating: z.enum(Ratings).nullish(),
        language: z.string(),
        chapters: z.array(
          z.object({
            number: z.number(),
            wordsCount: z.number(),
            url: z.string().default(""),
            title: z.string().default(""),
          }),
        ),
        shelves: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      const fanfic = await runTransaction(ctx.db, async () => {
        const fanficsReturned = await ctx.db
          .insert(fanfics)
          .values({
            userId: user.id,
            title: input.title,
            url: input.url,
            author: input.author,
            website: input.website,
            summary: input.summary,
            likesCount: input.likesCount,
            rating: input.rating,
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
            await ctx.db.insert(chapters).values({
              ...chapter,
              fanficId: fanfic.id,
              url: chapter.url,
              title: chapter.title,
            });
          }),
        );

        await Promise.all(
          input.shelves.map(async (shelfId) => {
            const shelfRelation = await ctx.db
              .select()
              .from(fanficsToShelves)
              .where(
                and(
                  eq(fanficsToShelves.shelfId, shelfId),
                  eq(fanficsToShelves.fanficId, fanfic.id),
                ),
              )
              .limit(1);

            if (shelfRelation.length > 0) {
              return;
            }
            await ctx.db.insert(fanficsToShelves).values({
              fanficId: fanfic.id,
              shelfId,
            });
          }),
        );

        return fanfic;
      });

      return {
        id: fanfic.id,
      };
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        url: z.url().nullish(),
        author: z.string(),
        website: z.string(),
        rating: z.enum(Ratings).nullish(),
        summary: z.string(),
        likesCount: z.number(),
        tags: z.array(z.string()),
        isCompleted: z.boolean(),
        fandom: z.array(z.string()),
        ships: z.array(z.string()),
        language: z.string(),
        grade: z.number().optional(),
        shelves: z.array(z.number()),
        chapters: z.array(
          z.object({
            number: z.number(),
            wordsCount: z.number(),
            url: z.string().default(""),
            title: z.string().default(""),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input.id);
      const fanfic = await runTransaction(ctx.db, async () => {
        const fanficsReturned = await ctx.db
          .update(fanfics)
          .set({
            userId: user.id,
            title: input.title,
            url: input.url,
            author: input.author,
            website: input.website,
            summary: input.summary,
            likesCount: input.likesCount,
            tags: input.tags,
            rating: input.rating,
            isCompleted: input.isCompleted,
            fandom: input.fandom,
            ships: input.ships,
            language: input.language,
            grade: input.grade,
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

        await ctx.db.delete(chapters).where(eq(chapters.fanficId, fanfic.id));
        await Promise.all(
          input.chapters.map(async (chapter) => {
            await ctx.db.insert(chapters).values({
              ...chapter,
              fanficId: fanfic.id,
              url: chapter.url,
              title: chapter.title,
            });
          }),
        );

        await ctx.db
          .delete(fanficsToShelves)
          .where(eq(fanficsToShelves.fanficId, fanfic.id));
        await Promise.all(
          input.shelves.map(async (shelfId) => {
            const shelfRelation = await ctx.db
              .select()
              .from(fanficsToShelves)
              .where(
                and(
                  eq(fanficsToShelves.shelfId, shelfId),
                  eq(fanficsToShelves.fanficId, fanfic.id),
                ),
              )
              .limit(1);

            if (shelfRelation.length > 0) {
              return;
            }
            await ctx.db.insert(fanficsToShelves).values({
              fanficId: fanfic.id,
              shelfId,
            });
          }),
        );

        return fanfic;
      });

      return {
        id: fanfic.id,
      };
    }),
  updateGrade: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        grade: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input.id);
      const fanfic = await runTransaction(ctx.db, async () => {
        const [currentFanfic] = await ctx.db
          .select({
            id: fanfics.id,
            grade: fanfics.grade,
          })
          .from(fanfics)
          .where(eq(fanfics.id, input.id));

        if (!currentFanfic) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error updating fanfic grade",
          });
        }

        const fanficsReturned = await ctx.db
          .update(fanfics)
          .set({
            grade: input.grade === currentFanfic.grade ? null : input.grade,
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

        return fanfic;
      });

      return {
        id: fanfic.id,
      };
    }),
  getChapters: protectedProcedure
    .input(z.object({ fanficId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input.fanficId);
      return ctx.db
        .select()
        .from(chapters)
        .where(eq(chapters.fanficId, input.fanficId))
        .orderBy(chapters.number);
    }),
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input);
      await runTransaction(ctx.db, async () => {
        // await db.delete(usersToFanfics).where(eq(usersToFanfics.fanficId, input));
        await ctx.db.delete(fanfics).where(eq(fanfics.id, input));
      });
    }),
});
