import { z } from "zod";
import { Points } from ".";
import { defaultObject, defaultObjectByDef } from "@/lib/zod";

const aBetSchema = z.number().nonnegative().default(0);

const betGroupSchema = <Bets extends readonly PropertyKey[]>(bets: Bets) => {
  return Object.fromEntries(bets.map(bet => [bet, aBetSchema])) as Record<Bets[number], typeof aBetSchema>
};
const betGroupSchemaObject = <Bets extends readonly PropertyKey[]>(bets: Bets) => {
  return defaultObjectByDef(betGroupSchema(bets));
};

export const EasyCrapsBetsSchema = defaultObjectByDef({
  ...betGroupSchema([
    // contract
    "passLine",
    // multi-roll
    "passLineOdds"
  ] as const),
  // multi-roll
  place: betGroupSchemaObject(Points),
  hardWays: betGroupSchemaObject([4,6,8,10] as const),
  // single-roll
  ...betGroupSchema([
    "field", "lowField", "highField",
    "C", "E", "C_and_E",
    "seven",
    "anyCraps",
  ] as const),
  horn: betGroupSchemaObject([2,3,11,12] as const),
  hop: betGroupSchemaObject([13,14,23,24,15,16,25,34,26,35,36,45,46] as const),
  hoppingHardWays: betGroupSchemaObject([4,6,8,10] as const),
});
export type EasyCrapsBets = z.infer<typeof EasyCrapsBetsSchema>;
export const EasyCrpsInitialBets = EasyCrapsBetsSchema.parse({});
