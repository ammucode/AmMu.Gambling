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

export const PointSchema = z.union(Points.map((p) => z.literal(p))).optional();
