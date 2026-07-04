import { List, Str } from '@/lib/hkt';
import z from 'zod';
import { Flow, Pipe } from 'hkt-core';
import { ArrayElement } from 'type-fest';

export const PointNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12] as const;

export function pointNumsToStr<Ps extends readonly number[]>(ps: Ps) {
  return ps.map((p) => `p${p}`) as unknown as Pipe<
    Ps,
    List.MapRO$<Flow<Str.ToString, Str.Prepend<'p'>>>
  >;
}

export const Points = PointNums; // PointNums.map(p=>`p${p}`) as unknown as Pipe<typeof PointNums, List.MapRO$<Flow<Str.ToString, Str.Prepend<'p'>>>>;
export type Point = ArrayElement<typeof Points>;

export const PointSchema = z.union(Points.map((p) => z.literal(p)));

export const TrueOddsPayouts = {
  2: [7, 1],
  3: [8, 2],
  4: [9, 3],
  5: [10, 4],
  6: [11, 5],
  8: [11, 5],
  9: [10, 4],
  10: [9, 3],
  11: [8, 2],
  12: [7, 1],
} as const satisfies Record<Point, [number, number]>;
export function getTrueOddsPayout<Roll extends keyof typeof TrueOddsPayouts>(
  roll: Roll
) {
  const [n, d] = TrueOddsPayouts[roll];
  return n / d;
}

export const PlaceBetPayouts = {
  2: [13, 2],
  3: [15, 4],
  4: [14, 5],
  5: [12, 5],
  6: [13, 6],
  8: [13, 6],
  9: [12, 5],
  10: [14, 5],
  11: [15, 4],
  12: [13, 2],
} as const satisfies Record<Point, [number, number]>;
export function getPlaceBetPayout<Roll extends keyof typeof PlaceBetPayouts>(
  roll: Roll
) {
  const [n, d] = PlaceBetPayouts[roll];
  return n / d;
}
