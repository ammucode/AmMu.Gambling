'use client';

import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from 'lucide-react';
import { Button } from '@ui/button';
import { FadingBar } from '../blocks/games/fading-bar';
import { useGameBalance } from '@hooks/games/use-game-balance';
import { SkeletonOr } from '@ui/skeleton';

export function BalanceManager() {
  const { gameBalance, invest, cashOut } = useGameBalance();
  return (
    <FadingBar className="mr-auto justify-start bg-linear-to-l">
      <Button
        variant="outline"
        size="sm"
        className="my-1 flex flex-row justify-between max-lg:text-xs"
        onClick={() => invest?.(100)}
      >
        <span>Add Balance</span>
        <span className="flex flex-row items-center">
          <SkeletonOr
            className="h-2 lg:h-4 w-[80%]"
            render={gameBalance?.accountBalance}
            before="$"
          />
          <BanknoteArrowDownIcon className="ml-1 lg:ml-3" />
        </span>
      </Button>
      <Button
        size="sm"
        className="my-1 flex flex-row justify-between max-lg:text-xs"
        onClick={() => cashOut?.()}
        disabled={gameBalance ? gameBalance.totalBet > 0 : true}
      >
        <span>Cash out</span>
        <SkeletonOr
          className="h-2 lg:h-4 w-[80%]"
          render={gameBalance?.playable}
          before="$"
        />
        <BanknoteArrowUpIcon />
      </Button>
    </FadingBar>
  );
}
