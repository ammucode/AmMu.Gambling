import { perGameTableResult_CRPCDefs } from '@convex-lib/crpc-games';
import { iHateNull } from '@convex-lib/document';
import z from 'zod';
import { createGamesBalanceCaller } from '../../generated/games/balance.runtime';
import { CRPCError } from 'kitcn/server';
import { easyCrapsSessionTable, gameSessionTable } from '~schema';
import { unsetToken, UpdateSet } from 'kitcn/orm';
import {
  EasyCrapsBetsSchema,
  EasyCrapsSchema,
  makeEasyCrapsInitialBets,
} from '@/lib/games/craps/easy';
import { rollDice, RollDiceResult } from '@/lib/games/simulation';
import { aBetSchema } from '@/lib/games/bets';
import { getPlaceBetPayout, getTrueOddsPayout } from '@/lib/games/craps';
import { sum } from '@/lib/utils';

const { query: easyCrapsQuery, mutation: easyCrapsMutation } =
  perGameTableResult_CRPCDefs['craps/easy'];

export const getSession = easyCrapsQuery
  .output(EasyCrapsSchema)
  .query(async ({ ctx }) => iHateNull(ctx.game.doc, true));

export const betPassline = easyCrapsMutation
  .input(z.object({ amount: z.number().positive() }))
  .output(z.number())
  .mutation(async ({ ctx, input }) => {
    if (ctx.game.doc.point)
      throw new CRPCError({
        code: 'PRECONDITION_FAILED',
        message: `Cannot make passline bet! Point is already set (${ctx.game.doc.point}).`,
      });

    const balance = createGamesBalanceCaller(ctx);
    void (await balance.makeBet(input));

    return (
      await ctx.orm
        .insert(easyCrapsSessionTable)
        .values({
          sessionKey: ctx.game.sessionKey,
          // bets: {
          //   ...ctx.game.bets,
          //   passLine: ctx.game.bets.passLine + input.amount
          // }
        })
        .onConflictDoUpdate({
          target: easyCrapsSessionTable.sessionKey,
          set: {
            bets: {
              ...ctx.game.bets,
              passLine: ctx.game.bets.passLine + input.amount,
            },
          },
        })
        .returning({
          bets: easyCrapsSessionTable.bets,
        })
    )[0].bets.passLine;
  });

export const roll = easyCrapsMutation
  .output(
    z.object({
      dice: z.tuple([
        z.number().min(1).max(6),
        z.number().min(1).max(6),
      ]) as z.ZodType<RollDiceResult<2>>,
      roll: z.number().min(2).max(12),
      newBets: z.object({
        total: aBetSchema,
        breakdown: EasyCrapsBetsSchema,
      }),
      winnings: z.object({
        total: aBetSchema,
        breakdown: EasyCrapsBetsSchema,
      }),
    })
  )
  .mutation(async ({ ctx }) => {
    const session = ctx.game.session;
    const game = ctx.game.doc;
    const bets = game.bets;

    if (session.totalBet === 0)
      throw new CRPCError({
        code: 'PRECONDITION_FAILED',
        message: `Cannot roll with no active bets!`,
      });

    const dice = rollDice(2);
    const roll = sum(dice);

    const winnings = makeEasyCrapsInitialBets();
    const newBets = makeEasyCrapsInitialBets();

    let totalWinnings = 0;
    let newTotalBet = 0;
    let gotResult = false;
    let newPoint = game.point;
    let shouldCopyPassline = false;

    if (game.point) {
      if (roll === 7) {
        newPoint = undefined;
        gotResult = true;
      } else {
        if (roll === game.point) {
          winnings.passLine = 2 * bets.passLine;
          totalWinnings += winnings.passLine;

          const payoutRatio = getTrueOddsPayout(roll);
          winnings.passLineOdds = payoutRatio * bets.passLineOdds;
          totalWinnings += winnings.passLineOdds;

          shouldCopyPassline = true;

          newPoint = undefined;
          gotResult = true;
        }
        const rollKey = `p${roll}` as const;
        if (bets.place[rollKey] > 0) {
          const payoutRatio = getPlaceBetPayout(roll);
          winnings.place[rollKey] = payoutRatio * bets.place[rollKey];
          totalWinnings += winnings.place[rollKey];
        }
      }
    } else {
      if (roll === 7) {
        winnings.passLine = 2 * bets.passLine;
        totalWinnings += winnings.passLine;

        shouldCopyPassline = true;

        gotResult = true;
      } else {
        newPoint = roll;
      }
    }

    if (shouldCopyPassline) {
      const toBet = Math.min(bets.passLine, session.playable + totalWinnings);
      newBets.passLine = toBet;
      newTotalBet += newBets.passLine;
    }

    const gameSessionUpdate = (
      gotResult
        ? {
            lastResultBet: session.totalBet,
            lastResultWon: totalWinnings,
            totalBet: newTotalBet,
            playable: session.playable + totalWinnings,
          }
        : {}
    ) satisfies UpdateSet<typeof gameSessionTable>;

    const easyCrapsSessionUpdate = {
      bets: gotResult ? newBets : undefined,
      rollHistory: [dice, ...game.rollHistory],
      point: newPoint ?? unsetToken,
    } satisfies UpdateSet<typeof easyCrapsSessionTable>;

    await ctx.orm
      .insert(gameSessionTable)
      .values({
        path: session.path,
        sessionKey: session.sessionKey,
        userId: session.userId,
        // ...gameSessionUpdate
      })
      .onConflictDoUpdate({
        target: gameSessionTable.sessionKey,
        set: gameSessionUpdate,
      });

    await ctx.orm
      .insert(easyCrapsSessionTable)
      .values({
        sessionKey: session.sessionKey,
        // ...easyCrapsSessionUpdate,
        // point: newPoint,
      })
      .onConflictDoUpdate({
        target: easyCrapsSessionTable.sessionKey,
        set: easyCrapsSessionUpdate,
      });

    return {
      dice,
      roll,
      winnings: {
        total: totalWinnings,
        breakdown: winnings,
      },
      newBets: {
        total: newTotalBet,
        breakdown: newBets,
      },
    };
  });
