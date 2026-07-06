import { gameMutation, gameQuery } from '@convex-lib/crpc-games';
import { gameBalanceSchema, gameSessionActiveBetsInfo, gameSessionActiveBetsInfoReturning } from '@convex/models';
import { eq } from 'kitcn/orm';
import { CRPCError } from 'kitcn/server';
import z from 'zod';
import { userTable, gameSessionTable } from '~schema';

const amountSchema = z.object({ amount: z.number().nonnegative() });

export const info = gameQuery
  .output(gameBalanceSchema.nullable())
  .query(async ({ ctx }) => {
    return {
      ...ctx.game.session,
      user: ctx.user,
    };
  });
export const invest = gameMutation
  .input(amountSchema)
  .mutation(async ({ ctx, input }) => {
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

export const makeBet = gameMutation
  .internal()
  .input(amountSchema)
  .output(gameSessionActiveBetsInfo)
  .mutation(async ({ ctx, input }) => {
    if (ctx.game.session.playable < input.amount) {
      throw new CRPCError({
        code: 'PAYLOAD_TOO_LARGE',
        message: `You don't have enough money!`,
      });
    }

  // return {playable:0,totalBet:0};
  return (await ctx.orm
    .update(gameSessionTable)
    .set({
      playable: ctx.game.session.playable - input.amount,
      totalBet: ctx.game.session.totalBet + input.amount,
    })
    .where(eq(gameSessionTable.sessionKey, ctx.game.session.sessionKey))
    .returning(gameSessionActiveBetsInfoReturning))[0];
});
