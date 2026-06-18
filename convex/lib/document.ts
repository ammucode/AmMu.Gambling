// export function createDoc<T>(doc: T) {
//   const date = new Date();
//   return {
//     ...doc,
//     createdAt: date,
//     updatedAt: date,
//   };
// }

import { IsLiteralDeep, MaybeUntagArray, StripNoInfer } from '@/lib/types';
import { If } from 'type-fest';

export type DeepReplaceNullWithUndefined<
  t,
  T extends StripNoInfer<t> = StripNoInfer<t>,
> = T extends unknown
  ? IsLiteralDeep<MaybeUntagArray<T>> extends true
    ? T
    : T extends undefined
      ? undefined
      : T extends null
        ? undefined
        : // : T extends NoInfer<infer N>|infer Rest ? DeepReplaceNullWithUndefined<Exclude<Rest, undefined|null>>
          T extends (infer U)[]
          ? DeepReplaceNullWithUndefined<U>[]
          : T extends object
            ? { [K in keyof T]: DeepReplaceNullWithUndefined<T[K]> }
            : T
  : never;
export function iHateNull<
  T,
  TopLevelNull extends boolean = false,
  Resolved extends DeepReplaceNullWithUndefined<T> =
    DeepReplaceNullWithUndefined<T>,
  Result extends If<
    TopLevelNull,
    Resolved extends undefined ? null : Resolved,
    Resolved
  > = If<TopLevelNull, Resolved extends undefined ? null : Resolved, Resolved>,
>(value: T, topLevelNull: TopLevelNull = false as TopLevelNull): Result {
  if (value === null || value === undefined)
    return (topLevelNull ? null : undefined) as Result;
  if (Array.isArray(value)) return value.map((v) => iHateNull(v)) as Result;
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, iHateNull(val)])
    ) as Result;
  }

  return value as Result;
}
