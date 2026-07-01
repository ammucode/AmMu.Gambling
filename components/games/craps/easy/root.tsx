'use client';

import { useCRPC } from '@/lib/convex/crpc';
import { GameProps } from '../../../../lib/games/client';
import { useQuery } from '@tanstack/react-query';
import {
  useGameMutation,
  useGameMutationCallback,
} from '@/hooks/games/use-game-request';
import { DiceComponent } from '../../dice';
import { EasyCrapsRewardDisplay } from './reward-display';

// export interface EasyCrapsProps extends GameProps {}
export type EasyCrapsProps = GameProps;
export function EasyCraps({ gameSession }: EasyCrapsProps) {
  const crpc = useCRPC();

  const {
    data: game,
    // isLoading: gameLoading,
    refetch: refetchGame,
  } = useQuery(crpc.games.craps.easy.getSession.queryOptions(gameSession));

  const betPassline = useGameMutationCallback(
    gameSession,
    crpc.games.craps.easy.betPassline.mutationOptions()
  );
  const {
    data: rollResult,
    isSuccess: rollSucceeded,
    isPending: rollInProgress,
    mutate: doRoll,
  } = useGameMutation(
    gameSession,
    crpc.games.craps.easy.roll.mutationOptions({
      onSuccess: async () => {
        await refetchGame();
      },
    })
  );

  const lastRoll = rollSucceeded ? rollResult.dice : game?.rollHistory[0];

  return (
    <>
      {rollSucceeded ? (
        <EasyCrapsRewardDisplay winnings={rollResult.winnings} />
      ) : null}
      <div className="absolute top-0 flex flex-col items-center lg:-top-10">
        <div
          onClick={() => doRoll()}
          className="flex h-fit w-fit flex-row items-center bg-none"
        >
          {!rollInProgress && !rollSucceeded ? 'Roll!' : null}
          {rollInProgress ? 'rolling...' : null}
          {rollSucceeded
            ? rollResult.dice.map((diceVal, i) => (
                <DiceComponent key={i} value={diceVal} size={100} />
              ))
            : null}
        </div>
      </div>
      <div className="absolute bottom-0 grid aspect-2/1 max-h-[calc(100%-72px)] max-w-full min-w-full grid-cols-14 grid-rows-22 bg-gray-800/30 transition-[min-width] duration-300 ease-in-out @max-md:hidden @5xl:min-w-[90%] @6xl:min-w-[80%]">
        <div className="col-span-4 col-start-1 row-span-19 row-start-1 grid bg-gray-800/30">
          hard
        </div>
        <div className="col-span-10 col-start-5 row-span-8 row-start-1 -mb-2 grid bg-gray-800/30">
          point/buy <br />
          Point: {game?.point ?? 'no point'}
        </div>
        <div className="col-span-3 col-start-5 row-span-10 row-start-10 grid bg-gray-800/30">
          C/E
        </div>
        <div
          className="col-span-7 col-start-8 row-span-10 row-start-10 grid bg-gray-800/30"
          onClick={() => betPassline({ amount: 10 })}
        >
          field/passline -- ${game?.bets.passLine ?? 0}
        </div>
        <div className="col-span-14 col-start-1 row-span-2 row-start-21 -mt-2 grid bg-gray-800/30">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col items-center gap-1 p-1">
              <span className="text-xs">Last Roll:</span>
              {lastRoll ? (
                <div className="flex flex-row items-center gap-1">
                  {lastRoll.map((diceVal, i) => (
                    <DiceComponent key={i} value={diceVal} size={30} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex w-full flex-row gap-4 overflow-x-scroll">
              {game?.rollHistory.slice(1).map((roll, i) => (
                <div key={i} className="flex flex-row items-center gap-1">
                  {roll.map((diceVal, j) => (
                    <DiceComponent key={j} value={diceVal} size={24} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
