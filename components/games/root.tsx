'use client';

import { clientifyGame, GamePath, getGameByPath } from '@/lib/games/games';
import { NoAccountBlock } from '../blocks/auth/no-account';
import { useCRPC } from '@/lib/convex/crpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useGameSession } from '@/hooks/games/use-game-session';
import { Skeleton } from '@ui/skeleton';
import { BalanceManager } from './balance-manager';
import { MoneyStats } from '../blocks/games/money-stats';

export interface GameWrapperProps {
  gamePath: GamePath;
}
export function GameRoot({ gamePath }: GameWrapperProps) {
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const [rootGame, subGame] = getGameByPath(gamePath);
  const activeGame = subGame ?? rootGame;

  const { user, userLoading, gameSession, gameSessionLoading } =
    useGameSession(gamePath);
  const maybeStartSessionMutation = useMutation(
    crpc.games.session.maybeStartSession.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries(
          crpc.games.session.getSession.staticQueryOptions({ gamePath })
        );
      },
    })
  );
  const maybeStartSession = useCallback(() => {
    maybeStartSessionMutation.mutate({ gamePath });
  }, [maybeStartSessionMutation, gamePath]);

  const needsSession = user && !gameSession && !gameSessionLoading;
  useEffect(() => {
    if (needsSession) {
      maybeStartSession();
    }
  }, [needsSession, maybeStartSession]);

  if (user ? !gameSession : userLoading) {
    return <Skeleton className="m-4 h-full w-full bg-accent" />;
  }

  if (!user) {
    return <NoAccountBlock onAuth={maybeStartSession} />;
  }

  let renderedGame: React.ReactNode = (
    <activeGame.component
      game={clientifyGame(activeGame)}
      fullPath={gamePath}
    />
  );

  if (subGame && rootGame.rootComponent) {
    renderedGame = (
      <rootGame.rootComponent
        game={clientifyGame(rootGame)}
        subGame={clientifyGame(subGame)}
      >
        {renderedGame}
      </rootGame.rootComponent>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col flex-wrap gap-4 md:flex-row md:justify-between md:gap-0">
        <BalanceManager />
        <MoneyStats
        // playable={gameSession.money}
        // bet={0}
        // lastResult={{ bet: 10, win: 50 }}
        />
      </div>
      {renderedGame}
    </>
  );
}
