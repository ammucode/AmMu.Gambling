import {
  GAME_PATH_SCHEMA,
  GameSlugSchema,
  getGameByPath,
  makeGameSessionKey,
  pathFromGameSessionKey,
} from '@/lib/games/games';
import { MarkNonNull } from '@/lib/types';
import { CRPCError } from 'kitcn/server';
import z from 'zod';
import { authMutation, optionalAuthQuery } from './crpc';
import { iHateNull } from './document';

const gameInputSchema = z
  .object({
    path: GAME_PATH_SCHEMA.optional(),
    sessionKey: GameSlugSchema.optional(),
  })
  .refine((data) => data.path || data.sessionKey, {
    message: 'Either path or sessionKey must be provided',
    path: ['path'],
  });

// type maybeGameMiddlewareParams = Parameters<Exclude<Parameters<typeof authMutation.use|typeof optionalAuthQuery.use>[0], AnyMiddlewareBuilder>>[0];
// const maybeGameMiddleware = async ({ctx, next, input}: maybeGameMiddlewareParams&{input: z.infer<typeof gameInputSchema>}) => {
//   const path = input.path ?? pathFromGameSessionKey(input.sessionKey!);
//   const sessionKey = input.sessionKey ?? (ctx.user && makeGameSessionKey(ctx.user.username, input.path!));
//   const gamePair = getGameByPath(path);
//   const activeGame = gamePair[1] ?? gamePair[0];
//   const gameSession = sessionKey ? iHateNull(
//     await ctx.orm.query.gameSession.findFirst({
//       where: { sessionKey },
//     }),
//     true
//   ) : null;

//   return next({
//     ctx: {
//       ...ctx,
//       game: { path: path, sessionKey, pair: gamePair, data: activeGame, session: gameSession },
//     },
//   });
// };

// // type maybeGameMiddlewareParams = Parameters<Exclude<Parameters<typeof authMutation.use|typeof authQuery.use>[0], AnyMiddlewareBuilder>>[0];
// const requireGameMiddleware = async ({ctx, next}: {ctx: Awaited<ReturnType<typeof maybeGameMiddleware>>["ctx"], next: maybeGameMiddlewareParams['next']}) => {
//   if (!ctx.game.session) {
//     throw new CRPCError({
//       code: 'PRECONDITION_FAILED',
//       message: `Requires active game session for ${ctx.game.data.title}`,
//     });
//   }

//   return next({
//     ctx: { ...(ctx as MarkNonNull<typeof ctx, 'user'>), game: ctx.game as MarkNonNull<typeof ctx.game, 'session'> },
//   });
// };

// export const maybeGameMutation = authMutation
//   .meta({game: 'optional'})
//   .input(gameInputSchema)
//   .use(maybeGameMiddleware);
// export const gameMutation = maybeGameMutation
//   .meta({game: 'required'})
//   .use(requireGameMiddleware);

// export const maybeGameQuery = optionalAuthQuery
//   .meta({game: 'optional'})
//   .input(gameInputSchema)
//   .use(maybeGameMiddleware);
// export const gameQuery = maybeGameQuery
//   .meta({game: 'required'})
//   .use(requireGameMiddleware);

export const maybeGameMutation = authMutation
  .input(gameInputSchema)
  .use(async ({ ctx, next, input }) => {
    const path = input.path ?? pathFromGameSessionKey(input.sessionKey!);
    const sessionKey =
      input.sessionKey ??
      (ctx.user && makeGameSessionKey(ctx.user.username, input.path!));
    const gamePair = getGameByPath(path);
    const activeGame = gamePair[1] ?? gamePair[0];
    const gameSession = sessionKey
      ? iHateNull(
          await ctx.orm.query.gameSession.findFirst({
            where: { sessionKey },
          }),
          true
        )
      : null;

    return next({
      ctx: {
        ...ctx,
        game: {
          path: path,
          sessionKey,
          pair: gamePair,
          data: activeGame,
          session: gameSession,
        },
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
  .input(gameInputSchema)
  .use(async ({ ctx, next, input }) => {
    const path = input.path ?? pathFromGameSessionKey(input.sessionKey!);
    const sessionKey =
      input.sessionKey ??
      (ctx.user && makeGameSessionKey(ctx.user.username, input.path!));
    const gamePair = getGameByPath(path);
    const activeGame = gamePair[1] ?? gamePair[0];
    const gameSession = sessionKey
      ? iHateNull(
          await ctx.orm.query.gameSession.findFirst({
            where: { sessionKey },
          }),
          true
        )
      : null;

    return next({
      ctx: {
        ...ctx,
        game: {
          path: path,
          sessionKey,
          pair: gamePair,
          data: activeGame,
          session: gameSession,
        },
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
