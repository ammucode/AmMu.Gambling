import { z } from 'zod';
import { gameSessionTable, userTable } from '~schema';
import { BuildQueryResult, DBQueryConfig } from 'kitcn/orm';
import { GAME_PATH_SCHEMA, GameSlugSchema } from '@/lib/games/games';
import { MyPartialDeep, MyStrictPartialDeep, StrictPartial, StrictPartialDeep } from '@/lib/types';
import { usernameSchema } from '@convex-lib/validators';
import { TableNames } from '../functions/_generated/dataModel';
import { OrmCtx } from '../functions/generated/server';
import { If, IsEqual, IsUnknown, Or, PartialDeep, SimplifyDeep } from 'type-fest';
import { FindFirstConfigNoSearch, KnownKeysOnlyStrict } from '@/lib/convex/kitcn-mirror';
import { dropField } from '@/lib/utils';

export type OrmSchema = OrmCtx["orm"]["query"][TableNames]["_"]["schema"];

function makeTableModel<
  TableName extends TableNames,
  Table extends OrmSchema[TableName]["table"],//ConvexTableWithColumns<TableConfig>,
  Cols extends Partial<Table['$inferSelect']>,
  ZObj extends z.ZodObject & z.ZodType<Cols>,
>(
  table: Table,
  schema: ZObj & z.ZodType<StrictPartial<Table['$inferSelect'], Cols>>
) {
  return {
    schema: schema as ZObj,
    cols: schema.keyof().def.entries as ReturnType<
      ZObj['keyof']
    >['def']['entries'],
    filter: Object.fromEntries(
      schema.keyof().options.map((field) => [field, true])
    ) as { [K in keyof ZObj['shape']]: true },
    returning: Object.fromEntries(
      schema.keyof().options.map((field: keyof ZObj['shape']) => [field, table[field]])
    ) as { [K in keyof ZObj['shape']]: Table[K] },
  };
}

export type userPublicInfo = z.infer<typeof userPublicInfo>;
export const {
  schema: userPublicInfo,
  cols: userPublicInfoColumns,
  filter: userPublicInfoColumnsFilter,
} = makeTableModel(
  userTable,
  z.object({
    username: usernameSchema.schema,
    displayUsername: z.string().optional(),
    image: z.string().optional(),
  })
);

export type userBalanceInfo = z.infer<typeof userBalanceInfo>;
export const {
  schema: userBalanceInfo,
  cols: userBalanceInfoColumns,
  filter: userBalanceInfoColumnsFilter,
} = makeTableModel(
  userTable,
  z.object({
    balance: z.number(),
  })
);

export type userPrivateInfo = z.infer<typeof userPrivateInfo>;
export const {
  schema: userPrivateInfo,
  cols: userPrivateInfoColumns,
  filter: userPrivateInfoColumnsFilter,
} = makeTableModel(
  userTable,
  z.object({
    ...userPublicInfo.def.shape,
    ...userBalanceInfo .def.shape,
  })
);

export type gameSessionInfo = z.infer<typeof gameSessionInfo>;
export const {
  schema: gameSessionInfo,
  cols: gameSessionInfoColumns,
  filter: gameSessionInfoColumnsFilter,
  returning: gameSessionInfoReturning,
} = makeTableModel(
  gameSessionTable,
  z.object({
    path: GAME_PATH_SCHEMA,
    sessionKey: GameSlugSchema,
    // playable: z.number(),
    // totalBet: z.number(),
    // lastResultBet: z.number(),
    // lastResultWon: z.number(),
  })
);

export type gameSessionBalanceInfo = z.infer<typeof gameSessionBalanceInfo>;
export const {
  schema: gameSessionBalanceInfo,
  cols: gameSessionBalanceInfoColumns,
  filter: gameSessionBalanceInfoColumnsFilter,
  returning: gameSessionBalanceInfoReturning,
} = makeTableModel(
  gameSessionTable,
  z.object({
    playable: z.number(),
    totalBet: z.number(),
    lastResultBet: z.number(),
    lastResultWon: z.number(),
  })
);



type QueryConfig<TableName extends TableNames> = FindFirstConfigNoSearch<OrmSchema, OrmSchema[TableName]>;
// type QueryConfig<TableName extends TableNames> = DBQueryConfig<'many', true, OrmSchema, OrmSchema[TableName]>

type RelationalModelOut<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>>,
  ZObjOut extends MyPartialDeep<Result>,
  ZObj extends z.ZodObject & z.ZodType<ZObjOut>,
> = {
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: ZObj & z.ZodType<MyStrictPartialDeep<Result, ZObjOut>>,
};
type RelationalModelWithXfmrOut<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>>,
  // ZObjOut extends MyPartialDeep<Result>,
  // ZObj extends z.ZodObject & z.ZodType<ZObjOut>,
  XfmrResult,
  XfmrZObjOut extends MyPartialDeep<XfmrResult>,
  XfmrZObj extends z.ZodType<XfmrZObjOut, Awaited<XfmrResult>>
> = {
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: XfmrZObj & z.ZodType<MyStrictPartialDeep<XfmrResult, XfmrZObjOut>>,
};

function makeRelationalModel<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>>,
  ZObjOut extends MyPartialDeep<Result>,
  ZObj extends z.ZodObject & z.ZodType<ZObjOut>,
>(
  _tableName: TableName,
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: ZObj & z.ZodType<MyStrictPartialDeep<Result, ZObjOut>>,
): RelationalModelOut<TableName, Query, Result, ZObjOut, ZObj>;
function makeRelationalModel<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>>,
  // ZObjOut extends MyPartialDeep<Result>,
  // ZObj extends z.ZodObject & z.ZodType<ZObjOut>,
  XfmrResult,
  XfmrZObjOut extends MyPartialDeep<XfmrResult>,
  XfmrZObj extends z.ZodType<XfmrZObjOut, Awaited<XfmrResult>>
>(
  _tableName: TableName,
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: NoInfer<XfmrZObj & z.ZodType<MyStrictPartialDeep<XfmrResult, XfmrZObjOut>>>,
  xfmr: (out: Result) => XfmrResult,
): RelationalModelWithXfmrOut<TableName, Query, Result, XfmrResult, XfmrZObjOut, XfmrZObj>;

function makeRelationalModel<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>>,
  // ZObjOut extends MyPartialDeep<Result>,
  // ZObj extends z.ZodObject & z.ZodType<ZObjOut>,
  XfmrResult,
  XfmrZObjOut extends MyPartialDeep<XfmrResult>,
  XfmrZObj extends z.ZodType<XfmrZObjOut, Awaited<XfmrResult>>
  // Xfmr extends {
  //   xfmr: (out: ZObjOut|null) => NewOut,
  //   outSchema: z.ZodType<NewOut, Awaited<NewOut>>,
  // } = {
  //   xfmr: (out: ZObjOut|null) => NewOut,
  //   outSchema: z.ZodType<NewOut, Awaited<NewOut>>,
  // }
  // Xfmr extends undefined|((out: ZObjOut) => unknown) = undefined,
>(
  _tableName: TableName,
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: XfmrZObj & z.ZodType<MyStrictPartialDeep<XfmrResult, XfmrZObjOut>>,
  xfmr?: (out: Result) => XfmrResult,
  // xfmr?: (out: ZObjOut|null) => XfmrResult,
  // { xfmr, outSchema }: Xfmr = {
  //   xfmr: (o: ZObjOut) => o,
  //   outSchema: schema
  // } as unknown as Xfmr
) {
  // const resultSchema = (schema as ZObj).nullable();
  return {
    // schema: schema as ZObj,
    schema: xfmr ? z.preprocess((arg: Result|null) => arg === null ? null : xfmr(arg), (schema as XfmrZObj)) : (schema as XfmrZObj),
    query,
  };
}

export type gameBalanceInfo = z.infer<typeof gameBalanceSchema>;
export const {
  schema: gameBalanceSchema,
  query: gameBalanceQuery,
  // performQuery: gameBalancePerformQuery,
} = makeRelationalModel(
  "gameSession",
  {
    with: {
      user: {
        columns: userBalanceInfoColumnsFilter
      }
    },
    columns: gameSessionBalanceInfoColumnsFilter,
  },
  // z.object({
  //   ...gameSessionBalanceInfo.def.shape,
  //   user: userBalanceInfo,
  // }),
  z.object({
    accountBalance: z.number(),
    playable: z.number(),
    totalBet: z.number(),
    lastResult: z.object({
      bet: z.number(),
      won: z.number(),
    }),
  }),
  o => {
    return {
      accountBalance: o.user.balance,
      playable: o.playable,
      totalBet: o.totalBet,
      lastResult: {
        bet: o.lastResultBet,
        won: o.lastResultWon,
      },
    }
  },
);