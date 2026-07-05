import { gameSessionTable, GameTables } from '~schema';
import { gameSessionInfo, gameSessionInfoReturning } from '@convex/models';
import { maybeGameMutation, maybeGameQuery } from '@convex-lib/crpc-games';
import { GamePathString } from '@/lib/games';
import { EasyCrpsInitialBets } from '@/lib/games/craps/easy';

export const maybeStartSession = maybeGameMutation
  .output(gameSessionInfo)
  .mutation(async ({ ctx }) => {
    if (ctx.game.session) {
      return ctx.game.session;
    }

    const gameSession = (
      await ctx.orm
        .insert(gameSessionTable)
        .values({
          path: ctx.game.path,
          userId: ctx.user.id,
          sessionKey: ctx.game.sessionKey,
        })
        .returning(gameSessionInfoReturning)
    )[0];

    await ctx.orm.insert(GameTables[ctx.game.pathString]).values({
      sessionKey: ctx.game.sessionKey,
      bets: EasyCrpsInitialBets
    });
    return gameSession;
  });

export const getSession = maybeGameQuery
  .output(gameSessionInfo.nullable())
  .query(
    async ({ ctx }) =>
      await gameSessionInfo.nullable().parseAsync(ctx.game.session)
  );
