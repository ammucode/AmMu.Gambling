import { useCallback } from 'react';

export function useMakeBet<
  Callback extends (input: { amount: number }) => unknown,
>(callback: Callback, {min,max}: {min?:number;max?:number}) {
  return useCallback((amount: number) => {
    if (min !== undefined && amount < min) amount = min;
    if (max !== undefined && amount > max) amount = max;
    return callback({ amount }) as ReturnType<Callback>
  }, [callback]);
}
