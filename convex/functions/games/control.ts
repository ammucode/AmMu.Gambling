import { z } from 'zod';

import { authMutation, optionalAuthQuery } from '@convex-lib/crpc';
import { gameSessionTable, userTable } from '~schema';
import {
  GAME_PATH_SCHEMA,
  getGameByPath,
  makeGameSessionKey,
} from '@/lib/games/games';
import {
  gameSessionInfo,
  gameSessionInfoColumnsFilter,
  gameSessionInfoReturning,
} from '@convex/models';
import { iHateNull } from '@convex-lib/document';
import { CRPCError } from 'kitcn/server';
import { MarkNonNull } from '@/lib/types';
import { eq } from 'kitcn/orm';
import { Simplify } from 'type-fest';

const maybeGameMutation = authMutation
  .input(z.object({ gamePath: GAME_PATH_SCHEMA }))
  .use(async ({ ctx, next, input }) => {
    const gamePair = getGameByPath(input.gamePath);
    const activeGame = gamePair[1] ?? gamePair[0];
    const gameSession = iHateNull(
      await ctx.orm.query.gameSession.findFirst({
        where: {
          sessionKey: makeGameSessionKey(ctx.user.username, input.gamePath),
        },
        columns: gameSessionInfoColumnsFilter,
      }),
      true
    );

    return next({
      ctx: {
        ...ctx,
        game: { pair: gamePair, data: activeGame, session: gameSession },
      },
    });
  });

export const gameMutation = maybeGameMutation.use(async ({ ctx, next }) => {
  if (!ctx.game.session) {
    throw new CRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Requires active game session for ${ctx.game.data.title}`,
    });
  }

  return next({
    ctx: { ...ctx, game: ctx.game as MarkNonNull<typeof ctx.game, 'session'> },
  });
});

export const maybeGameQuery = optionalAuthQuery
  .input(z.object({ gamePath: GAME_PATH_SCHEMA }))
  .use(async ({ ctx, next, input }) => {
    const gamePair = getGameByPath(input.gamePath);
    const activeGame = gamePair[1] ?? gamePair[0];
    const gameSession =
      ctx.user &&
      iHateNull(
        await ctx.orm.query.gameSession.findFirst({
          where: {
            sessionKey: makeGameSessionKey(ctx.user.username, input.gamePath),
          },
          columns: gameSessionInfoColumnsFilter,
        }),
        true
      );

    return next({
      ctx: {
        ...ctx,
        game: { pair: gamePair, data: activeGame, session: gameSession },
      },
    });
  });

export const gameQuery = maybeGameQuery.use(async ({ ctx, next }) => {
  if (!ctx.game.session) {
    throw new CRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Requires active game session for ${ctx.game.data.title}`,
    });
  }

  return next({
    ctx: { ...ctx, game: ctx.game as MarkNonNull<typeof ctx.game, 'session'> },
  });
});

export const maybeStartSession = maybeGameMutation
  .output(gameSessionInfo)
  .mutation(async ({ ctx, input }) => {
    console.log('start session! -- ', ctx.game.session);
    if (ctx.game.session) {
      return ctx.game.session;
    }

    return (
      await ctx.orm
        .insert(gameSessionTable)
        .values({
          path: input.gamePath,
          userId: ctx.user.id,
          sessionKey: makeGameSessionKey(ctx.user.username, input.gamePath),
        })
        .returning(gameSessionInfoReturning)
    )[0];
  });

export const getSession = maybeGameQuery
  .output(gameSessionInfo.nullable())
  .query(async ({ ctx }) => {
    return iHateNull(ctx.game.session, true);
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
      .set({ money: ctx.game.session.money + input.amount })
      .where(eq(gameSessionTable.sessionKey, ctx.game.session.sessionKey));
  });

export const cashout = gameMutation.mutation(async ({ ctx }) => {
  await ctx.orm
    .update(gameSessionTable)
    .set({ money: 0 })
    .where(eq(gameSessionTable.sessionKey, ctx.game.session.sessionKey));
  await ctx.orm
    .update(userTable)
    .set({ balance: ctx.user.balance + ctx.game.session.money })
    .where(eq(userTable.id, ctx.user.id));
});
