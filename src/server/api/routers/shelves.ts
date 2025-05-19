import { TRPCError } from "@trpc/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { preprocessStringToNumber } from "~/lib/utils";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  chapters,
  fanfics,
  fanficsToShelves,
  progress,
  shelves,
} from "~/server/db/schema";
import { getAllFanfics } from "~/server/services/fanfic";

export const shelveRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allShelves = await ctx.db
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

    const inProgressShelf = {
      id: -1,
      name: "In progress",
      icon: "",
      fanficsCount: (
        await ctx.db
          .select({
            fanficId: fanfics.id,
            progress: sql<number>`COALESCE(MAX(${progress.chapterNumber}), 0)`,
            chaptersCount: sql<number>`COALESCE(MAX(${chapters.number}), 0)`,
          })
          .from(fanfics)
          .leftJoin(progress, eq(fanfics.id, progress.fanficId))
          .leftJoin(chapters, eq(fanfics.id, chapters.fanficId))
          .leftJoin(fanficsToShelves, eq(fanfics.id, fanficsToShelves.fanficId))
          .groupBy(fanfics.id)
      ).filter(
        (fanfic) =>
          fanfic.progress > 0 && fanfic.progress < fanfic.chaptersCount,
      ).length,
    };

    return [inProgressShelf, ...allShelves];
  }),
  get: publicProcedure
    .input(z.preprocess(preprocessStringToNumber, z.number()))
    .query(async ({ ctx, input }) => {
      if (input === -1) {
        return {
          id: -1,
          name: "In progress",
          icon: "",
          fanfics: (await getAllFanfics(ctx.db)).filter(
            (fanfic) =>
              fanfic.progress > 0 && fanfic.progress < fanfic.chaptersCount,
          ),
        };
      }
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

      return {
        ...shelf,
        fanfics: await getAllFanfics(ctx.db, input),
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
    await ctx.db.delete(shelves).where(eq(shelves.id, input));
    return {
      id: shelve.id,
      name: shelve.name,
      icon: shelve.icon,
    };
  }),
  toggleFanfic: publicProcedure
    .input(z.object({ fanficId: z.number(), shelfId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const isInShelf = await ctx.db.query.fanficsToShelves.findFirst({
        where: (tb, { eq, and }) =>
          and(eq(tb.fanficId, input.fanficId), eq(tb.shelfId, input.shelfId)),
      });
      if (!isInShelf) {
        await ctx.db.insert(fanficsToShelves).values({
          fanficId: input.fanficId,
          shelfId: input.shelfId,
        });
        return "added";
      }
      await ctx.db
        .delete(fanficsToShelves)
        .where(eq(fanficsToShelves.fanficId, input.fanficId));
      return "removed";
    }),
});
