import { TRPCError } from "@trpc/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { preprocessStringToNumber } from "~/lib/utils";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  chapters,
  fanfics,
  fanficsToShelves,
  progress,
  shelves,
} from "~/server/db/schema";

export const shelveRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: shelves.id,
        name: shelves.name,
        icon: shelves.icon,
        fanficsCount: sql<number>`COUNT(${fanficsToShelves.fanficId})`,
      })
      .from(shelves)
      .leftJoin(fanficsToShelves, eq(shelves.id, fanficsToShelves.shelfId))
      .groupBy(shelves.id)
      .orderBy(asc(shelves.name));
  }),
  get: publicProcedure
    .input(z.preprocess(preprocessStringToNumber, z.number()))
    .query(async ({ ctx, input }) => {
      const shelf = await ctx.db.query.shelves.findFirst({
        where: (tb, { eq }) => eq(tb.id, input),
        columns: {
          id: true,
          name: true,
          icon: true,
        },
      });
      if (!shelf) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting shelf",
        });
      }
      const fanficInShelves = await ctx.db
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
        .innerJoin(fanficsToShelves, eq(fanfics.id, fanficsToShelves.fanficId))
        .leftJoin(progress, eq(fanfics.id, progress.fanficId))
        .leftJoin(chapters, eq(fanfics.id, chapters.fanficId))
        .groupBy(fanfics.id)
        .where(eq(fanficsToShelves.shelfId, input));

      return {
        ...shelf,
        fanfics: fanficInShelves,
      };
    }),
  create: publicProcedure
    .input(z.object({ name: z.string(), icon: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const shelvesReturned = await ctx.db
        .insert(shelves)
        .values({
          name: input.name,
          icon: input.icon,
        })
        .returning({
          id: shelves.id,
          name: shelves.name,
          icon: shelves.icon,
        });
      const shelve = shelvesReturned[0];
      if (!shelve) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating shelve",
        });
      }
      return {
        id: shelve.id,
        name: shelve.name,
        icon: shelve.icon,
      };
    }),
  edit: publicProcedure
    .input(z.object({ id: z.number(), name: z.string(), icon: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const shelvesReturned = await ctx.db
        .update(shelves)
        .set({
          name: input.name,
          icon: input.icon,
        })
        .where(eq(shelves.id, input.id))
        .returning({
          id: shelves.id,
          name: shelves.name,
          icon: shelves.icon,
        });
      const shelve = shelvesReturned[0];
      if (!shelve) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating shelve",
        });
      }
      return {
        id: shelve.id,
        name: shelve.name,
        icon: shelve.icon,
      };
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    if (input === 1) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Cannot delete default shelve",
      });
    }
    const shelve = await ctx.db.query.shelves.findFirst({
      where: (tb, { eq }) => eq(tb.id, input),
    });
    if (!shelve) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error creating shelve",
      });
    }
    await db.delete(shelves).where(eq(shelves.id, input));
    return {
      id: shelve.id,
      name: shelve.name,
      icon: shelve.icon,
    };
  }),
});
