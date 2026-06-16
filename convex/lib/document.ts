// export function createDoc<T>(doc: T) {
//   const date = new Date();
//   return {
//     ...doc,
//     createdAt: date,
//     updatedAt: date,
//   };
// }

import { IsLiteralDeep, MaybeUntagArray } from '@/lib/types';
import { If } from 'type-fest';

// export function updateDoc<T>(doc: T) {
//   return {
//     ...doc,
//     updatedAt: new Date(),
//   };
// }

type DeepReplaceNullWithUndefined<T> = T extends unknown
  ? IsLiteralDeep<MaybeUntagArray<T>> extends true
    ? T
    : T extends null | undefined
      ? undefined
      : // : T extends [] ? []
        // : T extends [infer Head] ? [DeepReplaceNullWithUndefined<Head>]
        // : T extends [infer Head, ...infer Tail] ? [DeepReplaceNullWithUndefined<Head>, ...DeepReplaceNullWithUndefined<Tail>]
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
  const sentinel = Symbol.for('iHateNull');
  if ((value ?? sentinel) === sentinel)
    return (topLevelNull ? null : undefined) as Result;
  if (value === null) return undefined as Result;
  if (value === undefined) return undefined as Result;
  if (Array.isArray(value)) return value.map((v) => iHateNull(v)) as Result;
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, iHateNull(val)])
    ) as Result;
  }

  return value as Result;
}
