import { z } from 'zod';
import { PointNums, pointNumsToStr, PointSchema } from '.';
import { defaultObjectByDef } from '@/lib/zod';
import { ReadonlyDeep, SimplifyDeep } from 'type-fest';
import { betGroupSchema, betGroupSchemaObject } from '../bets';
import { rollSchema } from '../simulation';

const pointListToSchema = <Ps extends readonly number[]>(ps: Ps) => {
  return betGroupSchemaObject(pointNumsToStr(ps));
};

export const EasyCrapsBetsSchema = defaultObjectByDef({
  ...betGroupSchema([
    // contract
    'passLine',
    // multi-roll
    'passLineOdds',
  ] as const),
  // multi-roll
  place: pointListToSchema(PointNums),
  hardWays: pointListToSchema([4, 6, 8, 10] as const),
  // single-roll
  ...betGroupSchema([
    'field',
    'lowField',
    'highField',
    'C',
    'E',
    'C_and_E',
    'seven',
    'anyCraps',
  ] as const),
  horn: pointListToSchema([2, 3, 11, 12] as const),
  hop: pointListToSchema([
    13, 14, 23, 24, 15, 16, 25, 34, 26, 35, 36, 45, 46,
  ] as const),
  hoppingHardWays: pointListToSchema([4, 6, 8, 10] as const),
});
export type EasyCrapsBets = z.infer<typeof EasyCrapsBetsSchema>;
export const makeEasyCrapsInitialBets = () => EasyCrapsBetsSchema.parse({});

export const EasyCrapsInitialBets = makeEasyCrapsInitialBets() as SimplifyDeep<
  ReadonlyDeep<EasyCrapsBets>
>;

export const EasyCrapsSchema = z.object({
  point: PointSchema,
  bets: EasyCrapsBetsSchema,
  rollHistory: z.array(rollSchema(2)),
});
