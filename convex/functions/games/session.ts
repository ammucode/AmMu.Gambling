import { gameSessionTable } from '~schema';
import { gameSessionBalanceInfoColumnsFilter, gameSessionInfo, gameSessionInfoReturning } from '@convex/models';
import { maybeGameMutation, maybeGameQuery } from '@convex-lib/crpc-games';

export const maybeStartSession = maybeGameMutation
  .output(gameSessionInfo)
  .mutation(async ({ ctx }) => {
    if (ctx.game.session) {
      return ctx.game.session;
    }

    const foo = await ctx.orm.query.easyCrapsSession.findFirst({
      with: {
        gameSession: {
          columns: gameSessionBalanceInfoColumnsFilter,
          // with: {
          //   user: {
          //     columns: {
          //       balance: true,
          //     }
          //   }
          // }
        },
        user: {
          columns: {balance: true}
        }
      },
      columns: {},
    });


    return (
      await ctx.orm
        .insert(gameSessionTable)
        .values({
          path: ctx.game.path,
          userId: ctx.user.id,
          sessionKey: ctx.game.sessionKey,
        })
        .returning(gameSessionInfoReturning)
    )[0];
  });

export const getSession = maybeGameQuery
  .output(gameSessionInfo.nullable())
  .query(
    async ({ ctx }) =>
      await gameSessionInfo.nullable().parseAsync(ctx.game.session)
  );
