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
import { getPlaceBetPayout, getTrueOddsPayout, PointSchema } from '@/lib/games/craps';
import { sum } from '@/lib/utils';
import { roundMoney } from '@/lib/games/money';

const { query: easyCrapsQuery, mutation: easyCrapsMutation } =
  perGameTableResult_CRPCDefs['craps/easy'];

export const getSession = easyCrapsQuery
  .output(EasyCrapsSchema)
  .query(async ({ ctx }) => iHateNull(ctx.game.doc, true));

const easyCrapsBetMutation = easyCrapsMutation
  .input(z.object({ amount: z.number() }))
  .output(z.number());

export const betPassline = easyCrapsBetMutation
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

export const betPlace = easyCrapsBetMutation
  .input(z.object({ point: PointSchema }))
  .mutation(async ({ ctx, input }) => {
    const balance = createGamesBalanceCaller(ctx);
    void (await balance.makeBet(input));

    const betKey = `p${input.point}` as const;

    return (
      await ctx.orm
        .insert(easyCrapsSessionTable)
        .values({
          sessionKey: ctx.game.sessionKey,
        })
        .onConflictDoUpdate({
          target: easyCrapsSessionTable.sessionKey,
          set: {
            bets: {
              ...ctx.game.bets,
              place: {
                ...ctx.game.bets.place,
                [betKey]: ctx.game.bets.place[betKey] + input.amount,
              }
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

    // const dice = [4,5] as RollDiceResult<2>;
    const dice = rollDice(2);
    const roll = sum(dice);


    let gotResult = false;
    let newPoint = game.point;

    const winnings = makeEasyCrapsInitialBets();
    let totalWinnings = 0;
    const reward = (amount: number) => {
      if (amount <= 0) return 0;
      totalWinnings += amount;
      return amount;
    }

    const newBets = EasyCrapsBetsSchema.parse(bets);
    let newTotalBet = session.totalBet;
    let autoRebet = 0;
    const unbet = (amount: number) => {
      if (amount <= 0) return 0;
      newTotalBet -= amount;
      return amount;
    }
    const rebet = (amount: number) => {
      if (amount <= 0) return 0;
      autoRebet += amount;
      return amount;
    }

    if (game.point) {
      if (roll === 7) {
        newPoint = undefined;
        gotResult = true;
        newBets.passLine -= unbet(bets.passLine);
        newBets.passLineOdds -= unbet(bets.passLineOdds);
      } else {
        if (roll === game.point) {
          winnings.passLine = reward(2 * bets.passLine);
          rebet(bets.passLine);

          const payoutRatio = getTrueOddsPayout(roll);
          winnings.passLineOdds = reward(roundMoney(bets.passLineOdds*payoutRatio));
          newBets.passLineOdds -= unbet(bets.passLineOdds);

          newPoint = undefined;
          gotResult = true;
        }
      }
    } else {
      if (roll === 7) {
        winnings.passLine = reward(2 * bets.passLine);
        rebet(bets.passLine);

        gotResult = true;
      } else {
        newPoint = roll;
      }
    }

    if (roll == 7) {
      for (const place in bets.place) {
        const placeBetKey = place as keyof typeof bets.place;
        newBets.place[placeBetKey] -= unbet(bets.place[placeBetKey]);
      }
    } else {
      const rollKey = `p${roll}` as const;
      if (bets.place[rollKey] > 0) {
        const payoutRatio = getPlaceBetPayout(roll);
        winnings.place[rollKey] = reward(roundMoney(bets.place[rollKey]*payoutRatio));
        rebet(bets.place[rollKey]);
        gotResult = true;
      }
    }

    const gameSessionUpdate = (
      (totalWinnings || autoRebet || newTotalBet != session.totalBet)
        ? {
            lastResultBet: session.totalBet,
            lastResultWon: totalWinnings,
            totalBet: newTotalBet,
            playable: roundMoney(session.playable + totalWinnings - autoRebet),
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
      })
      .onConflictDoUpdate({
        target: gameSessionTable.sessionKey,
        set: gameSessionUpdate,
      });

    await ctx.orm
      .insert(easyCrapsSessionTable)
      .values({
        sessionKey: session.sessionKey,
      })
      .onConflictDoUpdate({
        target: easyCrapsSessionTable.sessionKey,
        set: easyCrapsSessionUpdate,
      });

    return {
      dice,
      roll,
      winnings: {
        total: roundMoney(totalWinnings),
        breakdown: winnings,
      },
      newBets: {
        total: roundMoney(newTotalBet),
        breakdown: newBets,
      },
    };
  });
