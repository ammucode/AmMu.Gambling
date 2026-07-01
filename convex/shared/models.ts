import { z } from 'zod';
import { gameSessionTable, userTable } from '~schema';
import { BuildQueryResult } from 'kitcn/orm';
import { GAME_PATH_SCHEMA, GameSlugSchema } from '@/lib/games';
import { MyPartialDeep, MyStrictPartialDeep, StrictPartial } from '@/lib/types';
import { usernameSchema } from '@convex-lib/validators';
import { TableNames } from '../functions/_generated/dataModel';
import { OrmCtx } from '../functions/generated/server';
import { SimplifyDeep } from 'type-fest';
import {
  FindFirstConfigNoSearch,
  KnownKeysOnlyStrict,
} from '@/lib/convex/kitcn-mirror';
import { nullOptXfmr } from '@/lib/utils';
import { iHateNull } from '../lib/document';

export type OrmSchema = OrmCtx['orm']['query'][TableNames]['_']['schema'];

function makeTableModel<
  TableName extends TableNames,
  Table extends OrmSchema[TableName]['table'], //ConvexTableWithColumns<TableConfig>,
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
      schema
        .keyof()
        .options.map((field: keyof ZObj['shape']) => [field, table[field]])
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
    ...userBalanceInfo.def.shape,
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
  })
);

export type gameSessionActiveBetsInfo = z.infer<
  typeof gameSessionActiveBetsInfo
>;
export const {
  schema: gameSessionActiveBetsInfo,
  cols: gameSessionActiveBetsInfoColumns,
  filter: gameSessionActiveBetsInfoColumnsFilter,
  returning: gameSessionActiveBetsInfoReturning,
} = makeTableModel(
  gameSessionTable,
  z.object({
    playable: z.number(),
    totalBet: z.number(),
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
    ...gameSessionActiveBetsInfo.def.shape,
    lastResultBet: z.number(),
    lastResultWon: z.number(),
  })
);

type QueryConfig<TableName extends TableNames> = FindFirstConfigNoSearch<
  OrmSchema,
  OrmSchema[TableName]
>;
// type QueryConfig<TableName extends TableNames> = DBQueryConfig<'many', true, OrmSchema, OrmSchema[TableName]>

function makeRelationalModel<
  TableName extends TableNames,
  Query extends QueryConfig<TableName>,
  Result extends SimplifyDeep<
    Awaited<BuildQueryResult<OrmSchema, OrmSchema[TableName], Query>>
  >,
  Out extends MyPartialDeep<Result>,
  ZObj extends z.ZodObject & z.ZodType<Out>,
  NewOut = Out,
  // Xfmr extends undefined|((out: Out) => unknown) = undefined,
>(
  tableName: TableName,
  query: KnownKeysOnlyStrict<Query, QueryConfig<TableName>>,
  schema: ZObj & z.ZodType<MyStrictPartialDeep<Result, Out>>,
  select: (out: Out) => NewOut = (o) => o as unknown as NewOut
) {
  const selector = (out: Out) => iHateNull(select(out));
  return {
    schema: schema as unknown as ZObj,
    query,
    select: selector,
    selectNullish: nullOptXfmr(selector, undefined),
  };
}

export type gameBalanceInfo = z.infer<typeof gameBalanceSchema>;
export const {
  schema: gameBalanceSchema,
  query: gameBalanceQuery,
  select: gameBalanceSelect,
  selectNullish: gameBalanceSelectNullish,
} = makeRelationalModel(
  'gameSession',
  {
    with: {
      user: {
        columns: userBalanceInfoColumnsFilter,
      },
    },
    columns: gameSessionBalanceInfoColumnsFilter,
  },
  z.object({
    ...gameSessionBalanceInfo.def.shape,
    user: userBalanceInfo,
  }),
  (o) => {
    return {
      accountBalance: o.user.balance,
      playable: o.playable,
      totalBet: o.totalBet,
      lastResult: {
        bet: o.lastResultBet,
        won: o.lastResultWon,
      },
    };
  }
);
