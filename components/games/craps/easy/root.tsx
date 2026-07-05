'use client';

import { useCRPC } from '@/lib/convex/crpc';
import { GameProps } from '../../../../lib/games/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameMutation } from '@/hooks/games/use-game-request';

// export interface EasyCrapsProps extends GameProps {}
export type EasyCrapsProps = GameProps;
export function EasyCraps({gameSession}: EasyCrapsProps) {
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  
  const betPassline = useGameMutation(gameSession, crpc.games.craps.easy.betPassline.mutationOptions());

  return (
    <>
      <div className="absolute bottom-0 grid aspect-2/1 max-h-[calc(100%-72px)] max-w-full min-w-full grid-cols-14 grid-rows-22 bg-gray-800/30 transition-[min-width] duration-300 ease-in-out @max-md:hidden @5xl:min-w-[90%] @6xl:min-w-[80%]">
        <div className="col-span-4 col-start-1 row-span-19 row-start-1 grid bg-gray-800/30">
          hard
        </div>
        <div className="col-span-10 col-start-5 row-span-8 row-start-1 -mb-2 grid bg-gray-800/30">
          point/buy
        </div>
        <div className="col-span-3 col-start-5 row-span-10 row-start-10 grid bg-gray-800/30">
          C/E
        </div>
        <div
          className="col-span-7 col-start-8 row-span-10 row-start-10 grid bg-gray-800/30"
          onClick={() => betPassline({amount: 10})}
        >
          field/passline
        </div>
        <div className="col-span-14 col-start-1 row-span-2 row-start-21 -mt-2 grid bg-gray-800/30">
          history
        </div>
      </div>
    </>
  );
}
