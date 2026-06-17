import { iHateNull } from '@/convex/lib/document';
import { useCRPC } from '@/lib/convex/crpc';
import { GamePath } from '@/lib/games/games';
import useAuthInfo from '@hooks/use-auth-info';
import { skipToken, useQuery } from '@tanstack/react-query';

export function useGameSession(gamePath: GamePath) {
  const crpc = useCRPC();
  const { user, authLoading: userLoading } = useAuthInfo();
  const { data, isLoading: gameSessionLoading } = useQuery(
    crpc.games.control.getSession.queryOptions(user ? { gamePath } : skipToken)
  );
  const gameSession = iHateNull(data);
  return {
    user,
    userLoading,
    gameSession,
    gameSessionLoading,
  };
}
