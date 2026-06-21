import { Points } from '@/lib/games/craps';
import { perGameTableResult_CRPCDefs } from '@convex-lib/crpc-games';
import { iHateNull } from '@convex-lib/document';
import z from 'zod';
import { createGamesBalanceCaller } from '../../generated/games/balance.runtime';
import { CRPCError } from 'kitcn/server';
import { easyCrapsSessionTable } from '~schema';
import { eq } from 'kitcn/orm';

const { query: easyCrapsQuery, mutation: easyCrapsMutation } =
  perGameTableResult_CRPCDefs['craps/easy'];

export const getPoint = easyCrapsQuery
  .output(z.union(Points.map((point) => z.literal(point))).nullable())
  .query(async ({ ctx }) => {
    return iHateNull(ctx.game.doc.point, true);
  });

export const betPassline = easyCrapsMutation
  .input(z.object({ amount: z.number().positive() }))
  .output(z.number())
  .mutation(async ({ ctx, input }) => {
    if (ctx.game.doc.point) throw new CRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Cannot make passline bet! Point is already set (${ctx.game.doc.point}).`,
    });

    const balance = createGamesBalanceCaller(ctx);
    void await balance.makeBet(input);

    return (await ctx.orm
      .update(easyCrapsSessionTable)
      .set({
        bets: {
          ...ctx.game.bets,
          passLine: ctx.game.bets.passLine + input.amount
        }
      })
      .where(eq(easyCrapsSessionTable.sessionKey, ctx.game.session.sessionKey))
      .returning({
        bets: easyCrapsSessionTable.bets
      }))[0].bets.passLine;
  });
