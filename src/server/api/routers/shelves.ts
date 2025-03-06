import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import { shelves, fanfics } from "~/server/db/schema";

export const shelveRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.shelves.findMany({
      columns: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: [asc(shelves.name)],
    });
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
    await runTransaction(db, async () => {
      // const subs = await db
      //   .select()
      //   .from(fanfics)
      //   .where(eq(fanfics.shelve, input));
      // for (const sub of subs) {
      //   await db
      //     .delete(usersToFanfics)
      //     .where(eq(usersToFanfics.fanficId, sub.id));
      //   await db.delete(fanfics).where(eq(fanfics.id, sub.id));
      // }
      await db.delete(shelves).where(eq(shelves.id, input));
    });
    return {
      id: shelve.id,
      name: shelve.name,
      icon: shelve.icon,
    };
  }),
});
