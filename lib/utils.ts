import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SumMany } from './types';
import { RemovePrefix, Simplify } from 'type-fest';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dropField<Obj extends object, K extends keyof Obj>(
  o: Obj,
  key: K
) {
  return {
    ...o,
    [key]: undefined,
  } as Omit<Obj, K>;
}

export function nullOptXfmr<In, Out, Fallback extends null | undefined>(
  xfmr: (input: In) => Out,
  fallback: Fallback
) {
  return (input: In | null | undefined) => {
    if (input === null || input === undefined) return fallback;
    return xfmr(input);
  };
}

export function sum<Nums extends readonly number[]>(arr: Nums) {
  return arr.reduce((sum, val) => sum + val, 0) as SumMany<Nums>;
}

export function strictFromEntries<K extends PropertyKey, V>(entries: [K, V][]) {
  return Object.fromEntries(entries) as Simplify<Record<K, V>>;
}

export function stripPrefix<Str extends string, Prefix extends string>(
  str: Str,
  prefix: Prefix
): RemovePrefix<Str, Prefix> {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length) as RemovePrefix<Str, Prefix>; // Removes the exact prefix length
  }
  return str as RemovePrefix<Str, Prefix>;
}
