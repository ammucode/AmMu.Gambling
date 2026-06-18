import { z } from 'zod';
import schema, { gameSessionTable, GameTable, Select, userTable } from '~schema';
import { BuildQueryResult, ConvexTableWithColumns, DatabaseWithQuery, TableConfig, TableName, TableRelationalConfig, TablesRelationalConfig } from 'kitcn/orm';
import { GAME_PATH_SCHEMA, GameSlugSchema } from '@/lib/games/games';
import { StrictPartial, StrictPartialDeep } from '@/lib/types';
import { usernameSchema } from '@convex-lib/validators';
import { DataModel, TableNames } from '../functions/_generated/dataModel';
import { QueryCtx } from '../functions/generated/server';
import { PartialDeep, SimplifyDeep } from 'type-fest';
import { FindFirstConfigNoSearch, KnownKeysOnlyStrict } from '@/lib/convex/kitcn-mirror';

function makeTableModel<
  Table extends ConvexTableWithColumns<TableConfig>,
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
      schema.keyof().options.map((field) => [field, table[field]])
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

declare const ctxOrm: QueryCtx["orm"];
declare const ctxQuery: QueryCtx["orm"]["query"];
type Schema = QueryCtx["orm"] extends DatabaseWithQuery<infer TSchema extends TablesRelationalConfig> ? TSchema : never;
type TableConfigGeneric<TableName extends TableNames> = QueryCtx["orm"] extends DatabaseWithQuery<infer TSchema extends TablesRelationalConfig> ? TSchema[TableName] : never;
type Config<TableName extends TableNames> = FindFirstConfigNoSearch<Schema, TableConfigGeneric<TableName>>;
type ConfigParam<
  TableName extends TableNames,
  TConfig extends Config<TableName>,
  TSchema extends Schema = Schema,
  TTableConfig extends TableConfigGeneric<TableName> = TableConfigGeneric<TableName>,
  // THasIndex extends boolean = false,
> = KnownKeysOnlyStrict<TConfig, FindFirstConfigNoSearch<TSchema, TTableConfig>> // & EnforcedConfig<TConfig, TTableConfig, THasIndex>
// type t = typeof ctxQuery["easyCrapsSession"]["findFirst"]<5>;
// function foo<
//   TableName extends TableNames,
//   // TSchema extends TablesRelationalConfig,
//   // TTableConfig extends TableRelationalConfig,
//   TConfig extends Config<TableName>,
//   TConfigParam extends ConfigParam<TableName, TConfig> = ConfigParam<TableName, TConfig>
//   // TConfig extends typeof ctxQuery extends RelationalQueryBuilder<infer TSchema extends TablesRelationalConfig, infer TTableConfig extends TableRelationalConfig> ? FindFirstConfigNoSearch<TSchema, TTableConfig> : never,
// >(tableName: TableName) {
//   return ctxQuery[tableName].findFirst<TConfig>;
// }
// type tt = ReturnType<typeof foo<"easyCrapsSession">>

function makeRelationalModel<
  TableName extends TableNames,
  // TSchema extends TablesRelationalConfig,
  // TTableConfig extends TableRelationalConfig,
  // TConfig extends FindFirstConfigNoSearch<TSchema, TTableConfig>,
  // Query extends Parameters<QueryCtx["orm"]["query"][TableName]["findFirst"]>[0],
  // Result extends GelRelationalQuery,
  // Result extends ReturnType<QueryCtx["orm"]["query"][TableName]["findFirst"]>,
  // SearchF extends QueryCtx["orm"]["query"][TableName]["findFirst"],
  // SearchF extends QueryCtx["orm"]["query"][TableName]["findFirst"] & ((query: Query) => Result),
  // Query extends Parameters<SearchF>[0],
  // Result extends ReturnType<SearchF>,
  // Result extends Exclude<ReturnType<SearchF>, never>,
  // Result extends PartialDeep<ReturnType<SearchF>>,
  // Cols extends Partial<DataModel[TableName]['$inferSelect']>,
  // ZObj extends z.ZodObject & z.ZodType<Result>,
  // ZObj extends NoInfer<z.ZodObject & z.ZodType<Awaited<ReturnType<SearchF>>>>
  // TConfig extends Config<TableName>,
  Query extends ConfigParam<TableName, Config<TableName>>,
  TConfig extends Query extends ConfigParam<TableName, infer TConfig extends Config<TableName>> ? TConfig : never,
  Result extends Awaited<BuildQueryResult<Schema, TableConfigGeneric<TableName>, TConfig>|null>,
  // Out extends PartialDeep<Result>,
  Out extends Result,
  ZObj extends z.ZodObject & z.ZodType<SimplifyDeep<Out>>,
>(
  _tableName: TableName,
  query: Query,
  // schema: NoInfer<z.ZodObject & z.ZodType<Awaited<ReturnType<ReturnType<SearchF>["execute"]>>>>
  schema: NoInfer<ZObj>
  // schema: NoInfer<ZObj & z.ZodType<SimplifyDeep<StrictPartialDeep<Result, Out>>>>
) {
  return {
    // schema: schema as z.ZodObject & z.ZodType<Result>,
    schema,
    query
  };
}

// type Q = {
//   with: {
//     gameSession: {
//       columns: typeof gameSessionBalanceInfoColumnsFilter,
//       // with: {
//       //   user: {
//       //     columns: {
//       //       balance: true,
//       //     }
//       //   }
//       // }
//     },
//     user: {
//       columns: {balance: true}
//     }
//   },
//   columns: {},
// };
// type TN = "easyCrapsSession"
// type TC = Q extends ConfigParam<TN, infer TConfig extends Config<TN>> ? TConfig : never;
// type R = BuildQueryResult<Schema, TableConfigGeneric<TN>, TC>
// type O = SimplifyDeep<PartialDeep<R>>;

export const {
  schema: gameBalanceSchema,
  query: gameBalanceQuery,
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
  z.object({
    ...gameSessionBalanceInfo.def.shape,
    user: userBalanceInfo,
  })
);