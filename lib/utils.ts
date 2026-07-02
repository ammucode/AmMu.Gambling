import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SumMany } from './types';

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

export function sum<Nums extends number[]>(arr: Nums) {
  return (arr as any[]).reduce((sum, val) => sum + val, 0) as SumMany<Nums>;
}
