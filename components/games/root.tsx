'use client';

import { GamePath, GamePathString, getGameByPath } from '@/lib/games';
import { NoAccountBlock } from '../blocks/auth/no-account';
import { useCRPC } from '@/lib/convex/crpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useGameSession } from '@/hooks/games/use-game-session';
import { Skeleton } from '@ui/skeleton';
import { BalanceManager } from './balance-manager';
import { MoneyStats } from '../blocks/games/money-stats';
import { Card, CardContent } from '@ui/card';
import { GameComponentDefs } from '@/lib/games/client';
import { cn } from '@/lib/utils';

export interface GameWrapperProps {
  path: GamePath;
}
export function GameRoot({ path }: GameWrapperProps) {
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const [rootGame, subGame] = getGameByPath(path);
  const activeGame = subGame ?? rootGame;

  const { user, userLoading, gameSession, gameSessionLoading } =
    useGameSession(path);
  const maybeStartSessionMutation = useMutation(
    crpc.games.session.maybeStartSession.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries(
          crpc.games.session.getSession.staticQueryOptions({ path })
        );
      },
    })
  );
  const maybeStartSession = useCallback(() => {
    maybeStartSessionMutation.mutate({ path });
  }, [maybeStartSessionMutation, path]);

  const needsSession = user && !gameSession && !gameSessionLoading;
  useEffect(() => {
    if (needsSession) {
      maybeStartSession();
    }
  }, [needsSession, maybeStartSession]);

  const loadingDisplay = <Skeleton className="m-4 h-full w-full bg-accent" />;

  if (userLoading) return loadingDisplay;
  else if (!user) {
    return <NoAccountBlock onAuth={maybeStartSession} />;
  }

  if (gameSessionLoading) return loadingDisplay;
  else if (!gameSession) {
    return (
      <Card className="flex min-w-72 flex-col gap-6 sm:min-w-sm md:max-w-md">
        <CardContent>something broken! try reloading...</CardContent>
      </Card>
    );
  }

  const [rootComponent, subComponent] =
    GameComponentDefs[path.join('/') as GamePathString];
  const activeComponent = subComponent ?? rootComponent;

  let renderedGame: React.ReactNode = (
    <activeComponent.component
      game={activeGame}
      fullPath={path}
      gameSessionMeta={gameSession}
    />
  );

  if (subGame) {
    renderedGame = (
      <rootComponent.component
        game={rootGame}
        subGame={subGame}
        fullPath={path}
        gameSessionMeta={gameSession}
      >
        {renderedGame}
      </rootComponent.component>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col flex-wrap gap-4 md:flex-row md:justify-between md:gap-0 md:gap-y-4">
        <BalanceManager />
        <MoneyStats />
      </div>
      <div
        className={cn(
          '@container flex-1 relative w-full max-w-full max-[28rem]:hidden',
          false
            ? 'flex flex-col items-center justify-around'
            : 'grid place-items-center'
        )}
      >
        {renderedGame}
      </div>
    </>
  );
}
