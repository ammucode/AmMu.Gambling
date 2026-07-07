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
import { DragDropProvider, useDragDropMonitor } from '@dnd-kit/react';
import HeaderPortal from '../header/portal';

const debugDrags = true;

function DragMonitor() {
  useDragDropMonitor({
    // onBeforeDragStart(event) {
    //   // Optionally prevent dragging
    //   // if (shouldPreventDrag(event.operation.source)) {
    //   //   event.preventDefault();
    //   // }
    // },
    onDragStart(event) {
      console.log('Started dragging', event.operation.source);
    },
    // onDragMove(event) {
    //   // console.log('Current position:', event.operation.position);
    // },
    onDragOver(event) {
      console.log('Over droppable:', event.operation.target);
    },
    onDragEnd(event) {
      const { operation, canceled } = event;

      if (canceled) {
        console.log('Drag cancelled');
        return;
      }

      if (operation.target) {
        console.log(
          `Dropped ${operation.source?.id} onto ${operation.target.id}`
        );
      }
    },
    onCollision(event) {
      if (event.collisions.length) {
        console.log(
          'Collisions:',
          event.collisions.map((c) => c.id).join(', ')
        );
      }
    },
  });

  return null;
}

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
      <HeaderPortal>
        <div className="flex-1 flex flex-row flex-wrap items-center justify-between gap-1 gap-y-4">
          <BalanceManager />
          <MoneyStats />
        </div>
      </HeaderPortal>
      {/* <div className="flex w-full flex-col flex-wrap items-center gap-4 md:flex-row md:justify-between md:gap-0 md:gap-y-4">
      </div> */}
      <div
        className={cn(
          // 'bg-white',
          '@container',
          'relative w-[stretch] flex-1 min-h-0',
          'flex flex-col items-center justify-around'
        )}
      >
        <DragDropProvider
        // onBeforeDragStart={(event)=>((window as any).foo = event) && console.log("onBeforeDragStart", event)}
        // onCollision={(event)=>console.log("onCollision", event)}
        // onDragStart={(event)=>console.log("onDragStart", event)}
        // onDragMove={(event)=>console.log("onDragMove", event)}
        // onDragOver={(event)=>console.log("onDragOver", event)}
        // onDragEnd={(event)=>console.log("onDragEnd", event)}
        >
          {debugDrags ? (
            <>
              <DragMonitor />
              {/* <DragLogger /> */}
            </>
          ) : null}
          {renderedGame}
        </DragDropProvider>
      </div>
    </>
  );
}
