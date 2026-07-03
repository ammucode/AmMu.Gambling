'use client';

import { useCRPC } from '@/lib/convex/crpc';
import { GameProps } from '../../../../lib/games/client';
import { useQuery } from '@tanstack/react-query';
import {
  useGameMutation,
  useGameMutationCallback,
} from '@/hooks/games/use-game-request';
import { useGameBalance } from '@/hooks/games/use-game-balance';
import { Button } from '@/components/ui/button';
import { PlaceBetPayouts, Points } from '@/lib/games/craps';
import { cn } from '@/lib/utils';
import { RollHistory } from '../blocks/roll-history';
import { Chip } from '../../chip';
import { ChipTray } from '../../blocks/chip-tray';
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { useState } from 'react';
import { ChipDenomination } from '@/lib/games/chips';
import { useDropped } from '@/hooks/dnd/use-dropped';
import { useGuardedCallback } from '@/hooks/use-guarded-callback';
import { useMakeBet } from '@/hooks/games/use-make-bet';
import { EasyCrapsInitialBets } from '@/lib/games/craps/easy';

// export interface EasyCrapsProps extends GameProps {}
export type EasyCrapsProps = GameProps;
export function EasyCraps({ gameSessionMeta }: EasyCrapsProps) {
  const crpc = useCRPC();

  const { gameBalance } = useGameBalance();

  const {
    data: game,
    isLoading: gameLoading,
    refetch: refetchGame,
  } = useQuery(crpc.games.craps.easy.getSession.queryOptions(gameSessionMeta));
  const activeBets = game?.bets ?? EasyCrapsInitialBets;

  const betPassline = useGuardedCallback(
    useMakeBet(
      useGameMutationCallback(
        gameSessionMeta,
        crpc.games.craps.easy.betPassline.mutationOptions()
      ),
      {min: -activeBets.passLine, max: gameBalance?.playable}
    ),
    !gameLoading && game ? game.point === undefined : false
  );
  const {
    data: rollResult,
    isSuccess: rollSucceeded,
    isPending: rollInProgress,
    mutate: doRoll,
  } = useGameMutation(
    gameSessionMeta,
    crpc.games.craps.easy.roll.mutationOptions({
      onSuccess: async () => {
        await refetchGame();
      },
    })
  );

  const lastRoll = rollSucceeded ? rollResult.dice : game?.rollHistory[0];
  const canRoll =
    !gameLoading && !rollInProgress && (gameBalance?.totalBet ?? 0) > 0;

  const passlineDroppable = useDroppable({ id: 'passline', accept: 'chip' });
  const passlineBetDraggable = useDraggable({ id: 'passlineBet', type: 'bet' });

  useDropped(
    (source) => {
      const chip = parseInt(source.id.substring(4)) as ChipDenomination;
      console.log('dropped chip on passline!', chip);
      betPassline(chip);
    },
    {
      sourceType: 'chip',
      sourceIdPrefix: 'chip',
      targetId: passlineDroppable.droppable.id,
    }
  );

  useDropped(
    (source) => {
      if (source.id === 'passlineBet') {
        betPassline(-Math.min(activeChip, activeBets.passLine ?? 0));
      }
    },
    { sourceType: 'bet', targetId: 'chipTray' }
  );

  const [activeChip, setActiveChip] = useState<ChipDenomination>(1);

  return (
    <>
      <div className="grid aspect-2/1 max-w-full min-w-0 grid-cols-14 grid-rows-22 transition-[max-width] duration-300 ease-in-out @5xl:max-w-[90%] @6xl:max-w-[80%]">
        <div className="col-span-4 col-start-1 row-span-19 row-start-1 grid bg-gray-800/30">
          hard
        </div>
        <div className="col-span-10 col-start-5 row-span-8 row-start-1 -mb-2 grid min-h-0 max-w-full min-w-0 grid-cols-10 gap-0.75 overflow-x-scroll py-4 transition-[gap] duration-300 @lg:gap-1 @2xl:gap-1.5 @3xl:gap-2">
          {Points.map((point) => {
            const isPoint = point === game?.point;
            const [payoutNumerator, payoutDenominator] = PlaceBetPayouts[point];
            const bet = activeBets.place[`p${point}`];
            return (
              <div
                key={point}
                className={cn(
                  'col-span-1 flex flex-col items-center justify-center rounded-md border border-white/70 bg-black/20 px-1 text-center text-white inset-shadow-sm inset-shadow-black/50',
                  isPoint && 'bg-white/20'
                )}
              >
                <p className="text-xl font-bold transition-[font-size] duration-300 @lg:text-2xl @2xl:text-3xl @3xl:text-4xl @5xl:text-5xl">
                  {point}
                </p>
                <p className="text-[5px] font-medium text-nowrap transition-[font-size] duration-300 @lg:text-[6px] @2xl:text-[8px] @3xl:text-[10px] @5xl:text-xs">
                  PAYS
                  <br />
                  {payoutNumerator} FOR {payoutDenominator}
                </p>
                <Chip
                  value={bet}
                  dynamicSizing={true}
                  hideOnZero={true}
                  className={cn('@2xl:mt-3')}
                />
              </div>
            );
          })}
        </div>
        <div className="col-span-3 col-start-5 row-span-10 row-start-10 grid bg-gray-800/30">
          C/E
        </div>
        <div
          className={cn(
            'col-span-7 col-start-8 row-span-10 row-start-10',
            'flex flex-col items-center gap-0.5'
          )}
        >
          <div
            className={cn(
              'mt-[4%] min-h-0 w-full flex-1 rounded-md inset-ring inset-ring-white/50',
              'bg-white/10 inset-shadow-sm inset-shadow-black/20'
            )}
          >
            field
          </div>
          <div
            className={cn(
              'min-h-0 w-full flex-1 rounded-md inset-ring inset-ring-white/50',
              'bg-white/10 inset-shadow-sm inset-shadow-black/20'
            )}
          >
            low/high field
          </div>
          <div className={cn('min-h-0 w-full flex-1', '')}>
            <div
              ref={passlineDroppable.ref}
              onClick={() => betPassline(activeChip)}
              className={cn(
                'mt-[3%] h-fill w-full',
                'rounded-md inset-ring inset-ring-white/50',
                'bg-black/10 inset-shadow-sm inset-shadow-black/20',
                'grid place-items-center'
              )}
            >
              <Chip
                ref={passlineBetDraggable.ref}
                value={activeBets.passLine}
                hideOnZero={true}
                className={cn(
                  'h-3/4',
                  passlineDroppable.isDropTarget &&
                    'shadow-[0px_0px_64px_10px_rgba(255,221,0,1)]'
                )}
                dynamicTextSizing={true}
              />
            </div>
          </div>
        </div>
        <div className="col-span-14 col-start-1 row-span-2 row-start-21 -mt-2 min-h-0 min-w-0">
          <RollHistory
            lastRoll={lastRoll}
            history={game?.rollHistory?.slice(1) ?? []}
          />
        </div>
      </div>
      <ChipTray activeChip={activeChip} setActiveChip={setActiveChip} />
      <>
        {/* Abolsute display items */}
        {/* {rollSucceeded ? (
          <EasyCrapsRewardDisplay winnings={rollResult.winnings} />
        ) : null} */}
        {/* <div className="absolute top-0 flex flex-col items-center lg:-top-10">
          <div className="flex h-fit w-fit flex-row items-center bg-none">
            {rollInProgress ? (
              'rolling...'
            ) : lastRoll ? (
              <DiceComponent roll={lastRoll} size={100} />
            ) : null}
          </div>
        </div> */}
        <div className="absolute right-0 bottom-0">
          <Button
            onClick={() => doRoll()}
            disabled={!canRoll}
            className="aspect-square h-14 w-14 rounded-full bg-gray-400 text-2xl shadow-sm hover:bg-gray-300"
          >
            Roll
          </Button>
        </div>
      </>
    </>
  );
}
