export function createDoc<T>(doc: T) {
  const date = new Date();
  return {
    ...doc,
    createdAt: date,
    updatedAt: date,
  };
}

export function updateDoc<T>(doc: T) {
  return {
    ...doc,
    updatedAt: new Date(),
  };
}

type DeepReplaceNullWithUndefined<T> = T extends null | undefined
  ? undefined
  : T extends (infer U)[]
    ? DeepReplaceNullWithUndefined<U>[]
    : T extends object
      ? { [K in keyof T]: DeepReplaceNullWithUndefined<T[K]> }
      : T;
export function iHateNull<T>(value: T): DeepReplaceNullWithUndefined<T> {
  const sentinel = Symbol.for("iHateNull");
  if ((value ?? sentinel) === sentinel) return undefined as any;
  if (Array.isArray(value)) return value.map(iHateNull) as any;
  if (typeof value === 'object') {
    const result = {} as any;
    for (const key in value) {
      result[key] = iHateNull(value[key]);
    }
    return result;
  }

  return value as any;
}
