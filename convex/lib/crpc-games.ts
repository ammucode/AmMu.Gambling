import {
  GAME_PATH_SCHEMA,
  GamePathString,
  GamePathStringToGame,
  GameSlugSchema,
  getGameByPath,
  makeGameSessionKey,
  pathFromGameSessionKey,
  sessionKeyForGame,
} from '@/lib/games/games';
import { MarkNonNull, MySimplifyDeep } from '@/lib/types';
import {
  AnyMiddlewareBuilder,
  CRPCError,
  MiddlewareFunction,
  MutationProcedureBuilder,
  QueryProcedureBuilder,
  UnsetMarker,
} from 'kitcn/server';
import z from 'zod';
import { authMutation, optionalAuthQuery } from './crpc';
import { iHateNull } from './document';
import {
  gameSessionTable,
  GameTables,
  GameTablesKey,
  PerGameTableKey_Ctx,
  PerGameTableKey_Functor,
  PerGameTableKey_MakeEntry,
  PerGameTableKey_TypeLambda,
  perGameTableObj,
} from '~schema';
import { Doc } from '../functions/_generated/dataModel';
import { If, IsNever, IsUndefined, Simplify, SimplifyDeep } from 'type-fest';
import { BuildQueryResult, InferModelFromColumns } from 'kitcn/orm';
import { TablePolymorphicResult } from '@/lib/convex/kitcn-mirror';
import { OrmCtx } from '../functions/generated/server';
import {
  gameSessionInfo,
  gameSessionInfoReturning,
  OrmSchema,
} from '../shared/models';
import { Arg0 } from 'hkt-core';

const gameInputSchema = z
  .object({
    path: GAME_PATH_SCHEMA.optional(),
    sessionKey: GameSlugSchema.optional(),
  })
  .refine((data) => data.path || data.sessionKey, {
    message: 'Either path or sessionKey must be provided',
    path: ['path'],
  });


type QueryCtxForMiddleware<QueryBuilder> =
  QueryBuilder extends QueryProcedureBuilder<
    infer Q_TBaseCtx,
    infer Q_TContext,
    infer Q_TContextOverrides,
    infer Q_TInput,
    infer Q_TClientInput,
    infer Q_TOutput,
    infer Q_TMeta
  >
    ? Overwrite<Q_TContext, Q_TContextOverrides>
    : never;
type QueryMetaForMiddleware<QueryBuilder> =
  QueryBuilder extends QueryProcedureBuilder<
    infer Q_TBaseCtx,
    infer Q_TContext,
    infer Q_TContextOverrides,
    infer Q_TInput,
    infer Q_TClientInput,
    infer Q_TOutput,
    infer Q_TMeta
  >
    ? Q_TMeta
    : never;
type QueryCtxOverrideInForMiddleware<QueryBuilder> =
  QueryBuilder extends QueryProcedureBuilder<
    infer Q_TBaseCtx,
    infer Q_TContext,
    infer Q_TContextOverrides,
    infer Q_TInput,
    infer Q_TClientInput,
    infer Q_TOutput,
    infer Q_TMeta
  >
    ? Q_TContextOverrides
    : never;
type QueryInForMiddleware<QueryBuilder> =
  QueryBuilder extends QueryProcedureBuilder<
    infer Q_TBaseCtx,
    infer Q_TContext,
    infer Q_TContextOverrides,
    infer Q_TInput,
    infer Q_TClientInput,
    infer Q_TOutput,
    infer Q_TMeta
  >
    ? Q_TInput
    : unknown;

type MiddlewareConfig<TMiddleware> =
  TMiddleware extends MiddlewareFunction<
    infer Ctx,
    infer Meta,
    infer CtxOverIn,
    infer CtxOverOut,
    infer Input
  >
    ? {
        ctx: Ctx;
        meta: Meta;
        ctxOverIn: CtxOverIn;
        ctxOverOut: CtxOverOut;
        input: Input;
      }
    : never;
type OutputOfMiddleware<TMiddleware> =
  MiddlewareConfig<TMiddleware>['ctxOverOut'];

type MutationCtxForMiddleware<MutationBuilder> =
  MutationBuilder extends MutationProcedureBuilder<
    infer M_TBaseCtx,
    infer M_TContext,
    infer M_TContextOverrides,
    infer M_TInput,
    infer M_TOutput,
    infer M_TMeta
  >
    ? Overwrite<M_TContext, M_TContextOverrides>
    : never;
type MutationMetaForMiddleware<MutationBuilder> =
  MutationBuilder extends MutationProcedureBuilder<
    infer M_TBaseCtx,
    infer M_TContext,
    infer M_TContextOverrides,
    infer M_TInput,
    infer M_TOutput,
    infer M_TMeta
  >
    ? M_TMeta
    : never;
type MutationCtxOverrideInForMiddleware<MutationBuilder> =
  MutationBuilder extends MutationProcedureBuilder<
    infer M_TBaseCtx,
    infer M_TContext,
    infer M_TContextOverrides,
    infer M_TInput,
    infer M_TOutput,
    infer M_TMeta
  >
    ? M_TContextOverrides
    : never;
type MutationInForMiddleware<MutationBuilder> =
  MutationBuilder extends MutationProcedureBuilder<
    infer M_TBaseCtx,
    infer M_TContext,
    infer M_TContextOverrides,
    infer M_TInput,
    infer M_TOutput,
    infer M_TMeta
  >
    ? M_TInput
    : unknown;

function middlewareFor<
  QueryBuilderIn,
  MutationBuilderIn,
  QueryBuilder extends QueryBuilderIn extends QueryProcedureBuilder<
    infer Q_TBaseCtx,
    infer Q_TContext,
    infer Q_TContextOverrides,
    infer Q_TInput,
    infer Q_TClientInput,
    infer Q_TOutput,
    infer Q_TMeta
  >
    ? QueryProcedureBuilder<
        Q_TBaseCtx,
        Q_TContext,
        Q_TContextOverrides,
        Q_TInput,
        Q_TClientInput,
        Q_TOutput,
        Q_TMeta
      >
    : never,
  MutationBuilder extends MutationBuilderIn extends MutationProcedureBuilder<
    infer M_TBaseCtx,
    infer M_TContext,
    infer M_TContextOverrides,
    infer M_TInput,
    infer M_TOutput,
    infer M_TMeta
  >
    ? MutationProcedureBuilder<
        M_TBaseCtx,
        M_TContext,
        M_TContextOverrides,
        M_TInput,
        M_TOutput,
        M_TMeta
      >
    : never,
  TNewInput extends z.ZodObject<any>,
  TMiddleware extends MiddlewareFunction<
    | QueryCtxForMiddleware<QueryBuilderIn>
    | MutationCtxForMiddleware<MutationBuilderIn>,
    | QueryMetaForMiddleware<QueryBuilderIn>
    | MutationMetaForMiddleware<MutationBuilderIn>,
    | QueryCtxOverrideInForMiddleware<QueryBuilderIn>
    | MutationCtxOverrideInForMiddleware<MutationBuilderIn>,
    object,
    InferMiddlewareInput<
      IntersectIfDefined<
        | QueryInForMiddleware<QueryBuilderIn>
        | MutationInForMiddleware<MutationBuilderIn>,
        TNewInput
      >
    >
  >,
  QueryCtxAdjust extends
    | undefined
    | ((
        ctx: Overwrite<
          QueryCtxForMiddleware<QueryBuilderIn>,
          OutputOfMiddleware<TMiddleware>
        >
      ) => unknown),
  MutationCtxAdjust extends
    | undefined
    | ((
        ctx: Overwrite<
          MutationCtxForMiddleware<MutationBuilderIn>,
          OutputOfMiddleware<TMiddleware>
        >
      ) => unknown),
>(
  q: QueryBuilderIn & NoInfer<QueryBuilder>,
  m: MutationBuilderIn & NoInfer<MutationBuilder>,
  inputSchema: TNewInput,
  middleware: TMiddleware,
  queryAdjust?: QueryCtxAdjust,
  mutationAdjust?: MutationCtxAdjust
) {
  void queryAdjust;
  void mutationAdjust;

  type middlewareConf =
    TMiddleware extends MiddlewareFunction<
      infer Ctx,
      infer Meta,
      infer CtxOverIn,
      infer CtxOverOut extends object,
      infer Input
    >
      ? {
          ctx: Ctx;
          meta: Meta;
          ctxOverIn: CtxOverIn;
          ctxOverOut: CtxOverOut;
          input: Input;
        }
      : never;

  type QueryOverrides = object &
    Overwrite<
      middlewareConf['ctxOverOut'],
      If<
        IsUndefined<QueryCtxAdjust>,
        UnsetMarker,
        ReturnType<Exclude<QueryCtxAdjust, undefined>>
      >
    >;
  type MutationOverrides = object &
    Overwrite<
      middlewareConf['ctxOverOut'],
      If<
        IsUndefined<MutationCtxAdjust>,
        UnsetMarker,
        ReturnType<Exclude<MutationCtxAdjust, undefined>>
      >
    >;

  const queryMiddleware = middleware as unknown as MiddlewareFunction<
    QueryCtxForMiddleware<QueryBuilderIn>,
    QueryMetaForMiddleware<QueryBuilderIn>,
    QueryCtxOverrideInForMiddleware<QueryBuilderIn>,
    QueryOverrides,
    InferMiddlewareInput<
      IntersectIfDefined<QueryInForMiddleware<QueryBuilderIn>, TNewInput>
    >
  >;
  const mutationMiddleware = middleware as unknown as MiddlewareFunction<
    MutationCtxForMiddleware<MutationBuilderIn>,
    MutationMetaForMiddleware<MutationBuilderIn>,
    MutationCtxOverrideInForMiddleware<MutationBuilderIn>,
    MutationOverrides,
    InferMiddlewareInput<
      IntersectIfDefined<MutationInForMiddleware<MutationBuilderIn>, TNewInput>
    >
  >;
  const out = {
    query: q.input(inputSchema).use<QueryOverrides>(queryMiddleware),
    mutation: m.input(inputSchema).use<MutationOverrides>(mutationMiddleware),
    middleware,
  } as const;
  return out as typeof out & {
    _: {
      middleware: middlewareConf;
    };
  };
}
type Overwrite<TType, TWith> = TWith extends UnsetMarker
  ? TType
  : TType extends UnsetMarker
    ? TWith
    : TWith extends object
      ? Simplify<Omit<TType, keyof TWith> & TWith>
      : TType;
type InferMiddlewareInput<T> = T extends UnsetMarker
  ? unknown
  : T extends z.ZodObject<any>
    ? z.infer<T>
    : unknown;
type NeverToUnknown<T> = [T] extends [never] ? unknown : T;
type IntersectIfDefined<TType, TWith> = TType extends UnsetMarker
  ? TWith
  : TWith extends UnsetMarker
    ? TType
    : MergeZodObjects<TType, TWith>;
type MergeZodObjects<T, U> =
  T extends z.ZodObject<infer A>
    ? U extends z.ZodObject<infer B>
      ? z.ZodObject<Simplify<A & B>>
      : T
    : T;

export const { query: maybeGameQuery, mutation: maybeGameMutation_, middleware: maybeGameMiddleware } =
  middlewareFor(
    optionalAuthQuery,
    authMutation,
    gameInputSchema,
    async ({ ctx, next, input }) => {
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
    },
    undefined,
    (ctx) => ({
      ...(ctx as MarkNonNull<typeof ctx, 'user'>),
      game: ctx.game as MarkNonNull<typeof ctx.game, 'sessionKey'>,
    })
  );

export const maybeGameMutation = authMutation.input(gameInputSchema).use(maybeGameMiddleware).use(({ctx,next})=>next({
  ctx: {
    ...(ctx as MarkNonNull<typeof ctx, 'user'>),
    game: ctx.game as MarkNonNull<typeof ctx.game, 'sessionKey'>,
  }
}));

export const gameMutation = maybeGameMutation.use(async ({ ctx, next }) => {
  if (!ctx.game.session) {
    throw new CRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Requires active game session for ${ctx.game.data.title}`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      game: ctx.game as MarkNonNull<typeof ctx.game, 'session' | 'sessionKey'>,
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
    ctx: {
      ...(ctx as MarkNonNull<typeof ctx, 'user'>),
      game: ctx.game as MarkNonNull<typeof ctx.game, 'session' | 'sessionKey'>,
    },
  });
});

const PerGameTableKey_CRPCDefs_Func = <Path extends GameTablesKey>({
  path,
  tbl,
  tblName,
}: PerGameTableKey_Ctx<Path>) => {
  const expectedGame = GamePathStringToGame[path];
  type mutationOrQueryBuilder = typeof gameMutation | typeof gameQuery;
  type middlewareT = Exclude<
    Parameters<mutationOrQueryBuilder['use']>[0],
    AnyMiddlewareBuilder
  >;
  const middleware = (async ({ ctx, next }: Parameters<middlewareT>[0]) => {
    const wrongGameError = () =>
      new CRPCError({
        code: 'PRECONDITION_FAILED',
        message: `No game session is not for ${expectedGame.title}! (got ${ctx.game.sessionKey} for ${ctx.game.data.title})`,
      });
    if (!sessionKeyForGame(ctx.game.sessionKey, path)) {
      throw wrongGameError();
    }
    const gameDoc = iHateNull(
      await ctx.orm.query.gameSession.findFirst({
        where: { sessionKey: ctx.game.session.sessionKey },
        with: { [tblName]: true },
      })
    );
    if (!gameDoc?.[tblName]?.length) {
      throw wrongGameError();
    }

    return next({
      ctx: {
        ...ctx,
        gameDoc: gameDoc[tblName][0],
      },
    });
  }) satisfies Parameters<mutationOrQueryBuilder['use']>[0];
  return PerGameTableKey_MakeEntry(path, {
    mutation: gameMutation.use(middleware),
    query: gameQuery.use(middleware),
  });
};
interface PerGameTableKey_CRPCDefs_TypeLambda extends PerGameTableKey_TypeLambda<
  ReturnType<typeof PerGameTableKey_CRPCDefs_Func>
> {
  return: ReturnType<typeof PerGameTableKey_CRPCDefs_Func<Arg0<this>>>;
}
export const perGameTableResult_CRPCDefs =
  perGameTableObj<PerGameTableKey_CRPCDefs_TypeLambda>(
    PerGameTableKey_CRPCDefs_Func satisfies PerGameTableKey_Functor<PerGameTableKey_CRPCDefs_TypeLambda>
  );
