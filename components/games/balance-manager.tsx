'use client';

import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from 'lucide-react';
import { Button } from '@ui/button';
import { FadingBar } from '../blocks/games/fading-bar';
import { useGameBalance } from '@hooks/games/use-game-balance';
import { Skeleton, SkeletonOr } from '@ui/skeleton';


export function BalanceManager() {
  const { gameBalance, gameBalanceLoading, invest, cashOut } = useGameBalance();
  return (
    <FadingBar className="mr-auto bg-linear-to-l">
      <Button
        variant="outline"
        className="flex w-50 flex-row justify-between"
        onClick={() => invest?.(100)}
      >
        <span>Add Balance</span>
        <span className="flex flex-row items-center">
          <SkeletonOr className="h-4 w-[80%]" render={gameBalance?.accountBalance} before='$' />
          <BanknoteArrowDownIcon className="ml-3" />
        </span>
      </Button>
      <Button size="sm" onClick={() => cashOut?.()}>
        Cash out (<SkeletonOr className="h-4 w-[80%]" render={gameBalance?.playable} before='$' />)!
        <BanknoteArrowUpIcon />
      </Button>
    </FadingBar>
  );
}
