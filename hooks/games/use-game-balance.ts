import { useCRPC } from '@/lib/convex/crpc';
import { useGamePath } from './use-game-path';
import { useGameSession } from './use-game-session';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useGameBalance() {
  const crpc = useCRPC();
  const gamePath = useGamePath();
  const { user, userLoading, gameSession, gameSessionLoading } =
    useGameSession(gamePath);

  const investMutation = useMutation(
    crpc.games.balance.invest.mutationOptions()
  );
  const invest = useCallback(
    async (amount: number) => {
      await investMutation.mutateAsync({ gamePath, amount });
    },
    [investMutation, gamePath]
  );

  const cashOutMutation = useMutation(
    crpc.games.balance.cashOut.mutationOptions()
  );
  const cashOut = useCallback(async () => {
    await cashOutMutation.mutateAsync({ gamePath });
  }, [cashOutMutation, gamePath]);

  if (!user || userLoading || !gameSession || gameSessionLoading)
    throw new Error(`useGameBalance must be called from existing game session`);

  return {
    accountBalance: user.balance,
    playable: gameSession.playable,
    totalBet: gameSession.totalBet,
    lastResultBet: gameSession.lastResultBet,
    lastResultWon: gameSession.lastResultWon,
    invest,
    cashOut,
  };
}
