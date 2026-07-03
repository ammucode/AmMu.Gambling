import { useCallback } from 'react';

export function useMakeBet<
  Callback extends (input: { amount: number }) => unknown,
>(callback: Callback) {
  return useCallback(
    (amount: number) => callback({ amount }) as ReturnType<Callback>,
    [callback]
  );
}
