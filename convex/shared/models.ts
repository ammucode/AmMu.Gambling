import { z } from 'zod';
import { userTable } from '../functions/schema';
import { ConvexTableWithColumns, TableConfig } from 'kitcn/orm';

function getColumnsAndFilter<
  Table extends ConvexTableWithColumns<TableConfig>,
  ZObj extends z.ZodObject &
    z.ZodType<Partial<Record<keyof Table['$inferSelect'], any>>>,
>(_table: Table, schema: ZObj) {
  return {
    schema,
    cols: schema.keyof().def.entries as ReturnType<
      ZObj['keyof']
    >['def']['entries'],
    filter: Object.fromEntries(
      schema.keyof().options.map((field) => [field, true])
    ) as { [K in keyof ZObj['shape']]: true },
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
