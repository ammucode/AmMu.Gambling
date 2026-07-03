import { useCallback } from 'react';

export function useGuardedCallback<
  Callback extends (...args: unknown[]) => unknown,
>(callback: Callback, guard: boolean) {
  return useCallback(
    (...args: Parameters<Callback>) => {
      if (!guard) return;
      return callback(...args) as ReturnType<Callback>;
    },
    [callback, guard]
  );
}
