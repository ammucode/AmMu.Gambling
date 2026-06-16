import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUnionSchema<T extends readonly any[]>(values: T) {
  const literals = values.map((v) => z.literal(v)) as unknown as {
    [K in keyof T]: z.ZodLiteral<T[K]>;
  };
  return z.union(literals);
}
