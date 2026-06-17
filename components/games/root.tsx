'use client';

import { clientifyGame, GamePath, getGameByPath } from '@/lib/games/games';
import { NoAccountBlock } from '../blocks/auth/no-account';
import { useCRPC } from '@/lib/convex/crpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useGameSession } from '@/hooks/games/use-game-session';
import { Skeleton } from '@ui/skeleton';
import { BalanceManager } from './balance-manager';

export interface GameWrapperProps {
  gamePath: GamePath;
}
export function GameRoot({ gamePath }: GameWrapperProps) {
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const [rootGame, subGame] = getGameByPath(gamePath);
  const game = subGame ?? rootGame;

  const { user, session, gameSessionLoading } = useGameSession(gamePath);
  const maybeStartSessionMutation = useMutation(
    crpc.games.control.maybeStartSession.mutationOptions({
      onSettled: async (data) => {
        console.log('maybestart finished!', data);
        await queryClient.invalidateQueries(
          crpc.games.control.getSession.staticQueryOptions({ gamePath })
        );
      },
    })
  );
  const maybeStartSession = useCallback(() => {
    maybeStartSessionMutation.mutate({ gamePath });
  }, [maybeStartSessionMutation, gamePath]);

  const needsSession = user && !session && !gameSessionLoading;
  useEffect(() => {
    if (needsSession) {
      maybeStartSession();
    }
  }, [needsSession, maybeStartSession]);

  const thing = JSON.stringify({
    user: user?.username ?? 'no user',
    session: session?.sessionKey ?? 'no session',
  });
  console.log(thing);

  if (!user) {
    return (
      <div className="flex h-max w-full flex-col items-center">
        {thing}
        <NoAccountBlock onAuth={maybeStartSession} />
      </div>
    );
  }

  if (!session) {
    // if (!gameSessionLoading) {
    //   maybeStartSession();
    // }
    return (
      <div className="flex h-max w-full flex-col items-center">
        {thing}
        <Skeleton className="" />
      </div>
    );
  }

  let renderedGame: React.ReactNode = (
    <game.component game={clientifyGame(game)} fullPath={gamePath} />
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
    <div className="relative flex h-full w-full flex-col items-center">
      <BalanceManager balance={user.balance} session={session} />
      {renderedGame};
    </div>
  );
}
