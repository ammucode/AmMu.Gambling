import { z } from 'zod';
import { defaultObjectByDef } from '@/lib/zod';

export const aBetSchema = z.number().nonnegative().default(0);

export const betGroupSchema = <Bets extends readonly PropertyKey[]>(
  bets: Bets
) => {
  return Object.fromEntries(bets.map((bet) => [bet, aBetSchema])) as Record<
    Bets[number],
    typeof aBetSchema
  >;
};
export const betGroupSchemaObject = <Bets extends readonly PropertyKey[]>(
  bets: Bets
) => {
  return defaultObjectByDef(betGroupSchema(bets));
};
