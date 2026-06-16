import { z } from 'zod';
import { gameSessionTable, userTable } from '~schema';
import { ConvexTableWithColumns, TableConfig } from 'kitcn/orm';
import { GAME_PATHS } from '@/lib/games/games';
import { createUnionSchema } from '@/lib/zod';

function getColumnsAndFilter<
  Table extends ConvexTableWithColumns<TableConfig>,
  ZObj extends z.ZodObject & z.ZodType<Partial<Table['$inferSelect']>>,
>(table: Table, schema: ZObj) {
  return {
    schema,
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
} = getColumnsAndFilter(
  userTable,
  z.object({
    username: z.string(),
    displayUsername: z.string().optional(),
    image: z.string().optional(),
  })
);

export type userPrivateInfo = z.infer<typeof userPrivateInfo>;
export const {
  schema: userPrivateInfo,
  cols: userPrivateInfoColumns,
  filter: userPrivateInfoColumnsFilter,
} = getColumnsAndFilter(
  userTable,
  z.object({
    ...userPublicInfo.def.shape,
    age: z.number().optional(),
  })
);

export type gameSessionInfo = z.infer<typeof gameSessionInfo>;
export const {
  schema: gameSessionInfo,
  cols: gameSessionInfoColumns,
  filter: gameSessionInfoColumnsFilter,
  returning: gameSessionInfoReturning,
} = getColumnsAndFilter(
  gameSessionTable,
  z.object({
    path: createUnionSchema(GAME_PATHS),
    active: z.boolean(),
    invested: z.number(),
  })
);
