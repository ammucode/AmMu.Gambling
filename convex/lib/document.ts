// export function createDoc<T>(doc: T) {
//   const date = new Date();
//   return {
//     ...doc,
//     createdAt: date,
//     updatedAt: date,
//   };
// }

// export function updateDoc<T>(doc: T) {
//   return {
//     ...doc,
//     updatedAt: new Date(),
//   };
// }

type DeepReplaceNullWithUndefined<T> = T extends null | undefined
  ? undefined
  : T extends (infer U)[]
    ? DeepReplaceNullWithUndefined<U>[]
    : T extends object
      ? { [K in keyof T]: DeepReplaceNullWithUndefined<T[K]> }
      : T;
export function iHateNull<T>(value: T): DeepReplaceNullWithUndefined<T> {
  const sentinel = Symbol.for('iHateNull');
  if ((value ?? sentinel) === sentinel)
    return undefined as DeepReplaceNullWithUndefined<T>;
  if (value === null) return undefined as DeepReplaceNullWithUndefined<T>;
  if (value === undefined) return undefined as DeepReplaceNullWithUndefined<T>;
  if (Array.isArray(value))
    return value.map(iHateNull) as DeepReplaceNullWithUndefined<T>;
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, iHateNull(val)])
    ) as DeepReplaceNullWithUndefined<T>;
  }

  return value as DeepReplaceNullWithUndefined<T>;
}
