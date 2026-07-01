import { ZipObject } from "@/lib/types";
import z from "zod";
import { FixedLengthArray, IntClosedRange, IntRange, Simplify, TupleOf, UnionToTuple } from "type-fest";

export function randInt<Min extends number, Max extends number>(min: Min, max: Max): IntClosedRange<Min, Max> {
  return (Math.floor(Math.random() * (max - min + 1)) + min) as IntClosedRange<Min,Max>;
}

export type RollDiceResult<Count extends number, Sides extends number = 6> = TupleOf<Count, IntClosedRange<1,Sides>>;

export function rollDice<C extends number>(count: C): RollDiceResult<C, 6>;
export function rollDice<C extends number, S extends number>(count: C, sides: S): RollDiceResult<C, S>;
export function rollDice<C extends number, S extends number = 6>(count: C, sides: S = 6 as S) {
  return Array(count).fill(0).map(() => randInt(1,sides)) as unknown as RollDiceResult<C,S>;
}


export function rollSchema<C extends number, S extends number = 6>(count: C, sides: S = 6 as S) {
  const dieSchema = z.int().min(1).max(sides);
  const rollTuple = Array(count).fill(dieSchema) as [typeof dieSchema, ...typeof dieSchema[]];
  return z.custom<RollDiceResult<C,S>>(z.tuple(rollTuple).parse);
}
