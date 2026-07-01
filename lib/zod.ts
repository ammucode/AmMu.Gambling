import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUnionSchema<T extends readonly any[]>(values: T) {
  const literals = values.map((v) => z.literal(v)) as unknown as {
    [K in keyof T]: z.ZodLiteral<T[K]>;
  };
  return z.union(literals);
}

export function defaultObject<T extends z.ZodObject>(schema: T) {
  return z.transform((val) => val ?? {}).pipe(schema);
}

export function defaultObjectByDef<T extends Record<PropertyKey, z.ZodType>>(
  schemaDef: T
) {
  return z.transform((val) => val ?? {}).pipe(z.object(schemaDef));
}
