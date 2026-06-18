import { useCRPC } from '@/lib/convex/crpc';
import { useGamePath } from './use-game-path';
import { useGameSession } from './use-game-session';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { gameBalanceSelectNullish } from '@/convex/shared/models';

export function useGameBalance() {
  const crpc = useCRPC();
  const path = useGamePath();
  const { user, userLoading, gameSession, gameSessionLoading } =
    useGameSession(path);

  const { data: gameBalance, isLoading: gameBalanceLoading } = useQuery({
    ...crpc.games.balance.info.queryOptions(gameSession ?? skipToken),
    select: gameBalanceSelectNullish,
  });

  const investMutation = useMutation(
    crpc.games.balance.invest.mutationOptions()
  );
  const invest = useCallback(
    async (amount: number) => {
      await investMutation.mutateAsync({ path, amount });
    },
    [investMutation, path]
  );

  const cashOutMutation = useMutation(
    crpc.games.balance.cashOut.mutationOptions()
  );
  const cashOut = useCallback(async () => {
    await cashOutMutation.mutateAsync({ path });
  }, [cashOutMutation, path]);

  if (!user || userLoading || !gameSession || gameSessionLoading)
    throw new Error(`useGameBalance must be called from existing game session`);

  return {
    gameBalance,
    gameBalanceLoading,
    invest: gameBalanceLoading ? undefined : invest,
    cashOut: gameBalanceLoading ? undefined : cashOut,
  };
}
