import { gameSessionTable, GameTables } from '~schema';
import {
  gameSessionMetaInfo,
  gameSessionMetaInfoReturning,
} from '@convex/models';
import { maybeGameMutation, maybeGameQuery } from '@convex-lib/crpc-games';
import { EasyCrapsInitialBets } from '@/lib/games/craps/easy';

export const maybeStartSession = maybeGameMutation
  .output(gameSessionMetaInfo)
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
        .returning(gameSessionMetaInfoReturning)
    )[0];

    await ctx.orm.insert(GameTables[ctx.game.pathString]).values({
      sessionKey: ctx.game.sessionKey,
      bets: EasyCrapsInitialBets,
    });
    return gameSession;
  });

export const getSession = maybeGameQuery
  .output(gameSessionMetaInfo.nullable())
  .query(
    async ({ ctx }) =>
      await gameSessionMetaInfo.nullable().parseAsync(ctx.game.session)
  );
