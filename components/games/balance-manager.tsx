'use client';

import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from 'lucide-react';
import { Button } from '@ui/button';
import { FadingBar } from '../blocks/games/fading-bar';
import { useGameBalance } from '@hooks/games/use-game-balance';

// export interface BalanceManagerProps {
//   // balance: number;
//   // session: gameSessionInfo;
// }
export function BalanceManager() {
  const { accountBalance, invest, cashOut, playable } = useGameBalance();
  return (
    <FadingBar className="mr-auto bg-linear-to-l">
      <Button
        variant="outline"
        className="flex w-50 flex-row justify-between"
        onClick={() => invest(100)}
      >
        <span>Add Balance</span>
        <span className="flex flex-row items-center">
          ${accountBalance}
          <BanknoteArrowDownIcon className="ml-3" />
        </span>
      </Button>
      <Button size="sm" onClick={() => cashOut()}>
        Cash out (${playable})! <BanknoteArrowUpIcon />
      </Button>
    </FadingBar>
  );
}
