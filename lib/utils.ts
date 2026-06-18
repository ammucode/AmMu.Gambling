import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dropField<Obj extends object, K extends keyof Obj>(o: Obj, key: K) {
  return {
    ...o,
    key: undefined
  } as Omit<Obj, K>;
}