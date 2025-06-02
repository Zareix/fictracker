import { TRPCError } from "@trpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { preprocessStringToNumber } from "~/lib/utils";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUserFromSession } from "~/server/auth";
import { runTransaction } from "~/server/db";
import {
  chapters,
  fanfics,
  fanficsToShelves,
  progress,
  shelves,
} from "~/server/db/schema";
import { checkIsUserFanfic, getAllFanfics } from "~/server/services/fanfic";

export const shelveRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = getUserFromSession(ctx.session);
    const allShelves = await ctx.db.query.shelves.findMany({
      orderBy: (tb, { asc }) => asc(tb.name),
      where: (tb, { eq }) => eq(tb.userId, user.id),
      columns: {
        id: true,
        name: true,
        icon: true,
      },
    });
    return allShelves;
  }),
  getAllWithContent: protectedProcedure.query(async ({ ctx }) => {
    const user = getUserFromSession(ctx.session);
    const allShelves = await ctx.db
      .select({
        id: shelves.id,
        name: shelves.name,
        icon: shelves.icon,
        fanficsCount: sql<number>`COUNT(${fanficsToShelves.fanficId})`,
      })
      .from(shelves)
      .leftJoin(fanficsToShelves, eq(shelves.id, fanficsToShelves.shelfId))
      .where(eq(shelves.userId, user.id))
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
          .where(eq(fanfics.userId, user.id))
          .groupBy(fanfics.id)
      ).filter(
        (fanfic) =>
          fanfic.progress > 0 && fanfic.progress < fanfic.chaptersCount,
      ).length,
    };

    return [inProgressShelf, ...allShelves];
  }),
  get: protectedProcedure
    .input(z.preprocess(preprocessStringToNumber, z.number()))
    .query(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      if (input === -1) {
        return {
          id: -1,
          name: "In progress",
          icon: "",
          fanfics: (await getAllFanfics(ctx.db, user.id)).filter(
            (fanfic) =>
              fanfic.progress > 0 && fanfic.progress < fanfic.chaptersCount,
          ),
        };
      }
      const shelf = await ctx.db.query.shelves.findFirst({
        where: (tb, { eq, and }) =>
          and(eq(tb.userId, user.id), eq(tb.id, input)),
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
        fanfics: await getAllFanfics(ctx.db, user.id, input),
      };
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), icon: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      const shelvesReturned = await ctx.db
        .insert(shelves)
        .values({
          name: input.name,
          icon: input.icon,
          userId: user.id,
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
  edit: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        name: z.string(),
        icon: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);

      const shelvesReturned = await ctx.db
        .update(shelves)
        .set({
          name: input.name,
          icon: input.icon,
        })
        .where(and(eq(shelves.id, input.id), eq(shelves.userId, user.id)))
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
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      if (input === 1) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot delete default shelve",
        });
      }
      const shelve = await ctx.db.query.shelves.findFirst({
        where: (tb, { eq, and }) =>
          and(eq(tb.userId, user.id), eq(tb.id, input)),
      });
      if (!shelve) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating shelve",
        });
      }
      await runTransaction(ctx.db, async () => {
        await ctx.db
          .delete(fanficsToShelves)
          .where(eq(fanficsToShelves.shelfId, input));
        await ctx.db.delete(shelves).where(eq(shelves.id, input));
      });
      return {
        id: shelve.id,
        name: shelve.name,
        icon: shelve.icon,
      };
    }),
  toggleFanfic: protectedProcedure
    .input(z.object({ fanficId: z.number(), shelfId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = getUserFromSession(ctx.session);
      await checkIsUserFanfic(ctx.db, user.id, input.fanficId);
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
