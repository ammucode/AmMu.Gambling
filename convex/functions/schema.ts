import { GAME_PATH_SCHEMA, GAME_PATHS, GamePathString, GamePathStrings, GameSlug } from '@/lib/games/games';
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
import { Entries, Simplify } from 'type-fest';
import { Arg0, Arg1, Args, Ask, Call1, Call1W, Call2, Curry, Flow, Param0, Params, Pipe, RawArgsW, RetType, Sig, TArg, TolerantParams, TolerantRetType, TypeLambda, TypeLambda1, TypeLambda3, TypeLambdaG } from 'hkt-core'
import { List, ObjectHKTs } from '@/lib/hkt';

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

export const GameTables = {
  'craps/easy': {tableName: "easyCrapsSession", table: true}, //easyCrapsSessionTable,
  'video-poker': {tableName: "videoPokerSession", table: true}, //videoPokerSessionTable,
} as const //satisfies Partial<Record<GamePathString, TableDefinition>>;
export type GameTables = typeof GameTables;
export type GameTablesKey = keyof GameTables;
export type GameTable = GameTables[GameTablesKey];
export type GameTableName = GameTable["tableName"];
export type GameTableByName<Name extends GameTableName> = Simplify<GameTable & {tableName: Name}>;


interface PathToFunctorArgsLambda extends TypeLambda<[path: GameTablesKey], [GameTable, GameTableName, GamePathString]> {
  return: _PathToFunctorArgsLambda<Arg0<this>>;
}
type _PathToFunctorArgsLambda<Path extends GameTablesKey> = [GameTables[Path], GameTables[Path]["tableName"], Path];


interface PerGameFunctorTypeLambda<Ret extends readonly [PropertyKey, unknown]> extends TypeLambda1<[GameTable, GameTableName, GamePathString], Ret> {
  // table: Arg0<this>[0];
  // tableName: Arg0<this>[1];
  // path: Arg0<this>[2];
};
interface MakeTables extends PerGameFunctorTypeLambda<[GameTableName, GameTable]> {
  // return: [this["tableName"], this["table"]];
  return: [Arg0<this>[0]["tableName"], Arg0<this>[0]];
}

type PerGameFunctorPipe<F extends PerGameFunctorTypeLambda<[PropertyKey, unknown]>> = Pipe<GamePathStrings, List.Map$<PathToFunctorArgsLambda>, List.Map$<F>, ObjectHKTs.FromEntries>;
type final = Sig<PerGameFunctorTypeLambda<RetType<MakeTables>>>;
type t = PerGameFunctorPipe<MakeTables>;

// type PerGameLambda = <In extends RetType<PathToFunctorArgsLambda>, OutK extends PropertyKey, OutV>(arg: In) => [OutK, OutV];
type PerGameLambda = (arg: Call1<PathToFunctorArgsLambda, GamePathString>) => [PropertyKey, unknown];
// interface InferLambda<F extends PerGameLambda> extends PerGameFunctorTypeLambda<F extends PerGameLambda> {

// }
// interface PerGameGenericLambda extends TypeLambdaG<[["F", PerGameLambda], ["OutK", PropertyKey], "OutV"]> {
// interface PerGameGenericLambda extends TypeLambdaG<["F", ["Tbl", GameTable], ["TblName", GameTableName], ["Path", GamePathString], ["OutK", PropertyKey], "OutV"]> {
interface PerGameGenericLambda extends TypeLambdaG<[["F", PerGameLambda], ["Path", GameTablesKey]]> {
  signature: (
    // f: TArg<this, "F"> & ((arg: Call1<PathToFunctorArgsLambda, TArg<this, "Path">>) => [TArg<this, "OutK">, TArg<this, "OutV">])
    f: TArg<this, "F"> & ((arg: Call1<PathToFunctorArgsLambda, TArg<this, "Path">>) => [PropertyKey, unknown])
  ) => TypeLambda1<Call1<PathToFunctorArgsLambda, TArg<this, "Path">>, ReturnType<TArg<this, "F">>>;
  return: _PerGameGenericLambda<TArg<this, "F">, TArg<this, "Path">>;
}
type _PerGameGenericLambda<F extends PerGameLambda, Path extends GamePathString> = 
  F extends (arg: Call1<PathToFunctorArgsLambda, Path>) => [infer K extends PropertyKey, infer V]
    ? TypeLambda1<Call1<PathToFunctorArgsLambda, Path>, [K, V]>
    : TypeLambda<Call1<PathToFunctorArgsLambda, Path>, [PropertyKey, unknown]>;
// type _PerGameGenericLambda<F extends PerGameLambda> = 
//   F extends (arg: RetType<PathToFunctorArgsLambda>) => [infer K extends PropertyKey, infer V]
//     ? PerGameFunctorTypeLambda<[K, V]>
//     : never;
// type _PerGameGenericLambda<F extends PerGameLambda, OutK extends PropertyKey, OutV> = 
//   F extends (arg: RetType<PathToFunctorArgsLambda>) => [infer K extends OutK, infer V extends OutV]
//     ? PerGameFunctorTypeLambda<[K, V]>
//     : never;
// type _PerGameGenericLambda<F, Tbl extends GameTable, TblName extends GameTableName, Path extends GamePathString, OutK extends PropertyKey, OutV> = 
//   F extends (arg: [infer T extends Tbl, infer N extends TblName, infer P extends Path]) => [infer K extends OutK, infer V extends OutV]
//     ? TypeLambda1<[T, N, P], [K, V]>
//     : TypeLambda<[Tbl, TblName, GameTableName], [OutK, OutV]>;

const foo = <Path extends GamePathString>([tbl, name]: [GameTables[Path], GameTables[Path]["tableName"], Path]) => [name, tbl] as [GameTables[Path]["tableName"], GameTables[Path]];
type PGGLParams = TolerantParams<PerGameGenericLambda>[0];
type pgglfoo = typeof foo;
type PGGLMakeTable = Call1<PerGameGenericLambda, typeof foo>;
type tgpipepggltest = Pipe<GamePathStrings, List.Map$<PathToFunctorArgsLambda>, List.Map$<PGGLMakeTable>>//, ObjectHKTs.FromEntries>;

// type GameTableFunctor = <Path extends GamePathString, Table extends GameTables[Path], FK extends string, FV>(tbl: Table, name: Table['tableName'], pathString: Path) => [FK,FV]

function perGameTableObj<
  // K extends PropertyKey,
  // V,
  // Ret extends [PropertyKey, unknown],
  F extends PerGameFunctorTypeLambda<[PropertyKey, unknown]>,//(key: keyof GamePathString, value: T[keyof T]) => readonly [PropertyKey, any],
>(
  functor: Sig<F> //& ((...args: Parameters<Sig<F>>) => Ret),
): PerGameFunctorPipe<F>{// extends PerGameFunctor<[infer K extends PropertyKey, infer V]> ? PerGameFunctor<[K, V]>: F> {
  return Object.fromEntries(
    Object.entries(GameTables).map(([pathString, tbl]) => functor([tbl, tbl.tableName, pathString as keyof GameTables]))
  ) as PerGameFunctorPipe<F>;
}

const gschema = perGameTableObj<MakeTables>((([tbl]) => [tbl.tableName, tbl]));

export const tables = {
  user: userTable,
  session: sessionTable,
  account: accountTable,
  jwks: jwksTable,

  gameSession: gameSessionTable,
  ...perGameTableObj((([tbl]) => [tbl.tableName, tbl] as const)),
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
