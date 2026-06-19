import { gameMutation, gameQuery } from '@convex-lib/crpc-games';
import { gameBalanceSchema } from '@convex/models';
import { eq } from 'kitcn/orm';
import { CRPCError } from 'kitcn/server';
import z from 'zod';
import { userTable, gameSessionTable } from '~schema';

export const info = gameQuery
  .output(gameBalanceSchema.nullable())
  .query(async ({ ctx }) => {
    return {
      ...ctx.game.session,
      user: ctx.user,
    };
    // return await ctx.orm.query.gameSession.findFirst({
    //   ...gameBalanceQuery,
    //   where: { id: ctx.game.session.id },
    // });
  });
const amountSchema = z.object({ amount: z.number().nonnegative() });
export const invest = gameMutation
  .input(amountSchema)
  .mutation(async ({ ctx, input: input_ }) => {
    const input = input_ as z.infer<typeof amountSchema>;

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
