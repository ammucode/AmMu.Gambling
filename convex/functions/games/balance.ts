import { gameMutation, gameQuery } from '@convex-lib/crpc-games';
import {  gameBalanceQuery, gameBalanceSchema } from '@convex/models';
import { eq } from 'kitcn/orm';
import { CRPCError } from 'kitcn/server';
import { Simplify } from 'type-fest';
import z from 'zod';
import { userTable, gameSessionTable } from '~schema';

export const info = gameQuery
  .output(gameBalanceSchema.nullable())
  .query(async ({ ctx }) => {
    return await ctx.orm.query.gameSession.findFirst({
      ...gameBalanceQuery,
      where: { id: ctx.game.session.id },
    });
  });

export const invest = gameMutation
  .input(z.object({ amount: z.number().nonnegative() }))
  .mutation(async ({ ctx, input: input_ }) => {
    const input = input_ as Simplify<typeof input_ & { amount: number }>;

    if (ctx.user.balance < input.amount) {
      throw new CRPCError({
        code: 'PAYMENT_REQUIRED',
        message: `You don't have enough money!`,
      });
    }

    await ctx.orm
      .update(userTable)
      .set({ balance: ctx.user.balance - input.amount })
      .where(eq(userTable.id, ctx.user.id));

    await ctx.orm
      .update(gameSessionTable)
      .set({ playable: ctx.game.session.playable + input.amount })
      .where(eq(gameSessionTable.sessionKey, ctx.game.session.sessionKey));
  });

export const cashOut = gameMutation.mutation(async ({ ctx }) => {
  await ctx.orm
    .update(gameSessionTable)
    .set({ playable: 0 })
    .where(eq(gameSessionTable.sessionKey, ctx.game.session.sessionKey));
  await ctx.orm
    .update(userTable)
    .set({ balance: ctx.user.balance + ctx.game.session.playable })
    .where(eq(userTable.id, ctx.user.id));
});
