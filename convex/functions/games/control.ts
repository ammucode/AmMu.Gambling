import { z } from 'zod';

import { authMutation } from '@convex-lib/crpc';
import { gameSessionTable } from '~schema';
import { GAME_PATHS, getGameByPath } from '@/lib/games/games';
import { createUnionSchema } from '@/lib/zod';
import { makeGameSlug } from '@convex-lib/games';
import { gameSessionInfo, gameSessionInfoReturning } from '@convex/models';

export const start = authMutation
  .input(
    z.object({
      gamePath: createUnionSchema(GAME_PATHS),
    })
  )
  .output(gameSessionInfo)
  .mutation(async ({ ctx, input }) => {
    const userPathSlug = makeGameSlug(ctx.user, input.gamePath);

    const existing = await ctx.orm.query.gameSession.findFirst({
      where: { userPathSlug },
    });

    if (existing) {
      const gamePair = getGameByPath(input.gamePath);
      const game = gamePair[1] ?? gamePair[0];
      throw new Error(
        `Existing ${game.title} session exists for ${ctx.user.username}!`
      );
    }

    return (
      await ctx.orm
        .insert(gameSessionTable)
        .values({
          path: input.gamePath,
          userId: ctx.user.id,
          userPathSlug: userPathSlug,
        })
        .returning(gameSessionInfoReturning)
    )[0] as gameSessionInfo;
  });
