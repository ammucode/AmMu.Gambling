import {
  GAME_PATH_SCHEMA,
  GamePathString,
  GamePathStrings,
  GameSlug,
} from '@/lib/games';
import { TableDefinition } from 'convex/server';
import { v } from 'convex/values';
import {
  arrayOf,
  boolean,
  convexTable,
  custom,
  defineSchema,
  index,
  InferInsertModel,
  InferSelectModel,
  integer,
  json,
  text,
  timestamp,
  uniqueIndex,
} from 'kitcn/orm';
import z from 'zod';
import { Points } from '@/lib/games/craps';
import { Arg0, Call1, Pipe, TypeLambda1 } from 'hkt-core';
import { List, ObjectHKTs } from '@/lib/hkt';
import {
  EasyCrapsBets,
  makeEasyCrapsInitialBets,
} from '@/lib/games/craps/easy';
import { RollDiceResult } from '@/lib/games/simulation';

export const userTable = convexTable(
  'user',
  {
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    userId: text(),
    username: text().unique().notNull(),
    displayUsername: text(),
    isAnonymous: boolean().notNull(),
    balance: integer().notNull().default(0),
  },
  (userTable) => [
    index('email_name').on(userTable.email, userTable.name),
    index('name').on(userTable.name),
  ]
);

export const sessionTable = convexTable(
  'session',
  {
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
  },
  (sessionTable) => [
    index('expiresAt').on(sessionTable.expiresAt),
    index('expiresAt_userId').on(sessionTable.expiresAt, sessionTable.userId),
    index('userId').on(sessionTable.userId),
    // userIdFK(sessionTable.userId),
  ]
);

export const accountTable = convexTable(
  'account',
  {
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (accountTable) => [
    index('accountId').on(accountTable.accountId),
    index('accountId_providerId').on(
      accountTable.accountId,
      accountTable.providerId
    ),
    index('providerId_userId').on(accountTable.providerId, accountTable.userId),
    index('userId').on(accountTable.userId),
    // userIdFK(accountTable.userId),
  ]
);

export const jwksTable = convexTable('jwks', {
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
  expiresAt: timestamp(),
});

export const gameSessionTable = convexTable(
  'gameSession',
  {
    path: arrayOf(text().notNull())
      .notNull()
      .$type<z.infer<typeof GAME_PATH_SCHEMA>>(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    sessionKey: text().notNull().unique().$type<GameSlug>(),
    playable: integer().notNull().default(0),
    totalBet: integer().notNull().default(0),
    lastResultBet: integer().notNull().default(0),
    lastResultWon: integer().notNull().default(0),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (gameSessionTable) => [
    index('path').on(gameSessionTable.path),
    index('userId').on(gameSessionTable.userId),
    uniqueIndex('path_userId').on(
      gameSessionTable.path,
      gameSessionTable.userId
    ),
    // userIdFK(gameSessionTable.userId),
  ]
);

const genericGameColumns = {
  sessionKey: text()
    .notNull()
    .unique()
    .$type<GameSlug>()
    .references(() => gameSessionTable.sessionKey, { onDelete: 'cascade' }),
} as const satisfies Parameters<typeof convexTable>[1];
function genericGameExtras<Table extends typeof genericGameColumns>(
  table: Table
) {
  void table;
  return [] as const;
}

export const easyCrapsSessionTable = convexTable(
  'easyCrapsSession',
  {
    ...genericGameColumns,
    point: custom(
      v.optional(
        v.nullable(v.union(...Points.map((point) => v.literal(point))))
      )
    ),
    bets: json<EasyCrapsBets>().notNull().$defaultFn(makeEasyCrapsInitialBets),
    rollHistory: arrayOf(json<RollDiceResult<2>>().notNull())
      .notNull()
      .default([]),
  },
  (easyCrapsSessionTable) => [...genericGameExtras(easyCrapsSessionTable)]
);

export const videoPokerSessionTable = convexTable(
  'videoPokerSession',
  { ...genericGameColumns, bets: json<object>().notNull() },
  (videoPokerSessionTable) => [...genericGameExtras(videoPokerSessionTable)]
);

export const GameTables = {
  'craps/easy': easyCrapsSessionTable,
  'video-poker': videoPokerSessionTable,
} as const satisfies Record<GamePathString, TableDefinition>;
export type GameTables = typeof GameTables;
export type GameTablesKey = keyof GameTables;
export type GameTable = GameTables[GameTablesKey];

export type PerGameTableKey_LambdaOutUpper = [PropertyKey, unknown];
export type PerGameTableKey_TypeLambda<
  Ret extends PerGameTableKey_LambdaOutUpper,
> = TypeLambda1<GameTablesKey, Ret>;
export type PerGameTableKey_Ctx<Path extends GameTablesKey> = {
  path: Path;
  tbl: GameTables[Path];
  tblName: GameTables[Path]['tableName'];
};
export type PerGameTableKey_Functor<
  Lambda extends PerGameTableKey_TypeLambda<PerGameTableKey_LambdaOutUpper> =
    PerGameTableKey_TypeLambda<PerGameTableKey_LambdaOutUpper>,
> = <Path extends GameTablesKey>(
  ctx: PerGameTableKey_Ctx<Path>
) => Call1<Lambda, Path>;

export type PerGameTableKey_Pipe<
  Lambda extends PerGameTableKey_TypeLambda<PerGameTableKey_LambdaOutUpper>,
> = Pipe<GamePathStrings, List.MapRO$<Lambda>, ObjectHKTs.FromEntries>;
export function perGameTableObj<
  Lambda extends PerGameTableKey_TypeLambda<PerGameTableKey_LambdaOutUpper>,
>(functor: PerGameTableKey_Functor<Lambda>) {
  return Object.fromEntries(
    GamePathStrings.map((path) =>
      functor({
        path,
        tbl: GameTables[path],
        tblName: GameTables[path].tableName,
      })
    )
  ) as PerGameTableKey_Pipe<Lambda>;
}
export const PerGameTableKey_MakeEntry = <
  K extends PerGameTableKey_LambdaOutUpper[0],
  V extends PerGameTableKey_LambdaOutUpper[1],
>(
  k: K,
  v: V
) => [k, v] as [K, V];

/* TEMPLATE:
const PerGameTableKey_<FILL>_Func = <Path extends GameTablesKey>({,}: PerGameTableKey_Ctx<Path>) => {
  return PerGameTableKey_MakeEntry(,);
};
interface PerGameTableKey_<FILL>_TypeLambda extends PerGameTableKey_TypeLambda<
  ReturnType<typeof PerGameTableKey_<FILL>_Func>
> {
  return: ReturnType<typeof PerGameTableKey_<FILL>_Func<Arg0<this>>>;
}
const perGameTableResult_<FILL> =
  perGameTableObj<PerGameTableKey_<FILL>_TypeLambda>(
    PerGameTableKey_<FILL>_Func satisfies PerGameTableKey_Functor<PerGameTableKey_<FILL>_TypeLambda>
  );
*/

const PerGameTableKey_Schema_Func = <Path extends GameTablesKey>({
  tbl,
  tblName,
}: PerGameTableKey_Ctx<Path>) => {
  return PerGameTableKey_MakeEntry(tblName, tbl);
};
interface PerGameTableKey_Schema_TypeLambda extends PerGameTableKey_TypeLambda<
  ReturnType<typeof PerGameTableKey_Schema_Func>
> {
  return: ReturnType<typeof PerGameTableKey_Schema_Func<Arg0<this>>>;
}
const perGameTableResult_Schema =
  perGameTableObj<PerGameTableKey_Schema_TypeLambda>(
    PerGameTableKey_Schema_Func satisfies PerGameTableKey_Functor<PerGameTableKey_Schema_TypeLambda>
  );

export const tables = {
  user: userTable,
  session: sessionTable,
  account: accountTable,
  jwks: jwksTable,

  gameSession: gameSessionTable,
  ...perGameTableResult_Schema,
};
export type TableName = keyof typeof tables;
export type Select<T extends TableName> = InferSelectModel<(typeof tables)[T]>;
export type Insert<T extends TableName> = InferInsertModel<(typeof tables)[T]>;

export const Schema = defineSchema(tables).relations((r) => {
  const PerGameTableKey_Relations_gameSession_Func = <
    Path extends GameTablesKey,
  >({
    tblName,
  }: PerGameTableKey_Ctx<Path>) => {
    return PerGameTableKey_MakeEntry(
      tblName,
      r.many[tblName]({
        from: r.gameSession.sessionKey,
        to: r[tblName].sessionKey,
      })
    );
  };
  interface PerGameTableKey_Relations_gameSession_TypeLambda extends PerGameTableKey_TypeLambda<
    ReturnType<typeof PerGameTableKey_Relations_gameSession_Func>
  > {
    return: ReturnType<
      typeof PerGameTableKey_Relations_gameSession_Func<Arg0<this>>
    >;
  }
  const perGameTableResult_Relations_gameSession =
    perGameTableObj<PerGameTableKey_Relations_gameSession_TypeLambda>(
      PerGameTableKey_Relations_gameSession_Func satisfies PerGameTableKey_Functor<PerGameTableKey_Relations_gameSession_TypeLambda>
    );

  const PerGameTableKey_Relations_game_Func = <Path extends GameTablesKey>({
    tblName,
  }: PerGameTableKey_Ctx<Path>) => {
    return PerGameTableKey_MakeEntry(tblName, {
      gameSession: r.one.gameSession({
        from: r[tblName].sessionKey,
        to: r.gameSession.sessionKey,
        optional: false,
      }),
      user: r.one.user({
        from: r[tblName].sessionKey.through(r.gameSession.userId),
        to: r.user.userId.through(r.gameSession.sessionKey),
        optional: false,
      }),
    });
  };
  interface PerGameTableKey_Relations_game_TypeLambda extends PerGameTableKey_TypeLambda<
    ReturnType<typeof PerGameTableKey_Relations_game_Func>
  > {
    return: ReturnType<typeof PerGameTableKey_Relations_game_Func<Arg0<this>>>;
  }
  const perGameTableResult_Relations_game =
    perGameTableObj<PerGameTableKey_Relations_game_TypeLambda>(
      PerGameTableKey_Relations_game_Func satisfies PerGameTableKey_Functor<PerGameTableKey_Relations_game_TypeLambda>
    );

  return {
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      gameSessions: r.many.gameSession({
        from: r.user.id,
        to: r.gameSession.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    gameSession: {
      user: r.one.user({
        from: r.gameSession.userId,
        to: r.user.id,
        optional: false,
      }),
      ...perGameTableResult_Relations_gameSession,
    },
    ...perGameTableResult_Relations_game,
  };
});
export default Schema;
