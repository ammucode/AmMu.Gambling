import { z } from 'zod';
import { gameSessionTable, userTable } from '~schema';
import { ConvexTableWithColumns, TableConfig } from 'kitcn/orm';
import {
  GAME_PATH_SCHEMA,
  GAME_SESSION_KEY_DELIM,
  GamePathStrings,
} from '@/lib/games/games';
import { StrictPartial } from '@/lib/types';
import { usernameSchema } from '@convex-lib/validators';

function getColumnsAndFilter<
  Table extends ConvexTableWithColumns<TableConfig>,
  Cols extends Partial<Table['$inferSelect']>,
  ZObj extends z.ZodObject & z.ZodType<Cols>,
>(
  table: Table,
  schema: ZObj & z.ZodType<StrictPartial<Table['$inferSelect'], Cols>>
) {
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
    username: usernameSchema.schema,
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
    balance: z.number(),
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
    path: GAME_PATH_SCHEMA,
    sessionKey: z.templateLiteral([
      z.string(),
      GAME_SESSION_KEY_DELIM,
      z.enum(GamePathStrings),
    ]),
    money: z.number(),
  })
);
