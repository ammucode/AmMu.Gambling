import { GAME_PATH_SCHEMA, GamePathString, GameSlug } from '@/lib/games/games';
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
  text,
  timestamp,
  uniqueIndex,
} from 'kitcn/orm';
import z from 'zod';
import { Points } from "@/lib/games/craps"
import { Simplify } from 'type-fest';

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
  },
  (easyCrapsSessionTable) => [...genericGameExtras(easyCrapsSessionTable)]
);

export const videoPokerSessionTable = convexTable(
  'videoPokerSession',
  { ...genericGameColumns },
  (videoPokerSessionTable) => [...genericGameExtras(videoPokerSessionTable)]
);

export const gameTables = {
  'craps/easy': easyCrapsSessionTable,
  'video-poker': videoPokerSessionTable,
} as const satisfies Partial<Record<GamePathString, TableDefinition>>;
export type gameTables = typeof gameTables;
export type GameTable = gameTables[keyof gameTables];
export type GameTableName = GameTable["tableName"];
export type GameTableByName<Name extends GameTableName> = Simplify<GameTable & {tableName: Name}>;

type GameTableFunctor = <Path extends GamePathString, Table extends gameTables[Path], FK extends string, FV>(tbl: Table, name: Table['tableName'], pathString: Path) => [FK,FV]

function perGameTableObj<
  K extends PropertyKey,
  V,
  F extends GameTableFunctor,//(key: keyof GamePathString, value: T[keyof T]) => readonly [PropertyKey, any],
>(
  functor: F
): Record<K, V> {
  return Object.fromEntries(
    Object.entries(gameTables).map(([pathString, tbl]) => functor(tbl, tbl.tableName, pathString as keyof gameTables))
  ) as Record<K, V>;
}

export const tables = {
  user: userTable,
  session: sessionTable,
  account: accountTable,
  jwks: jwksTable,

  gameSession: gameSessionTable,
  ...perGameTableObj(((tbl) => [tbl.tableName, tbl] as const) as GameTableFunctor),
};
export type TableName = keyof typeof tables;
export type Select<T extends TableName> = InferSelectModel<(typeof tables)[T]>;
export type Insert<T extends TableName> = InferInsertModel<(typeof tables)[T]>;

export const Schema = defineSchema(tables).relations((r) => ({
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
    ...perGameTableObj((_, name) => [
      name,
      r.many[name]({
        from: r.gameSession.sessionKey,
        to: r[name].sessionKey,
      }),
    ]),
  },
  ...perGameTableObj((_, name) => [
    name,
    {
      gameSession: r.one.gameSession({
        from: r[name].sessionKey,
        to: r.gameSession.sessionKey,
        optional: false,
      }),
      user: r.one.user({
        from: r[name].sessionKey.through(r.gameSession.userId),
        to: r.user.userId.through(r.gameSession.sessionKey),
        optional: false,
      }),
    },
  ]),
}));
export default Schema;
