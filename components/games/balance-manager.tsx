'use client';

import { gameSessionInfo } from '@/convex/shared/models';
import { Card, CardContent } from '@ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from 'lucide-react';
import { Button } from '@ui/button';
import { MoneyStats } from '../blocks/games/money-stats';
import { FadingBar } from '../blocks/games/fading-bar';
import { useGameSession } from '@hooks/games/use-game-session';
import { useGameBalance } from '@hooks/games/use-game-balance';

export interface BalanceManagerProps {
  balance: number;
  session: gameSessionInfo;
}
export function BalanceManager({ balance, session }: BalanceManagerProps) {
  const {} = useGameBalance();
  return (
    <FadingBar className='bg-linear-to-l mr-auto'>
      <Button
        variant="outline"
        className="flex w-50 flex-row justify-between"
      >
        <span>Add Balance</span>
        <span className="flex flex-row items-center">
          ${balance}
          <BanknoteArrowDownIcon className="ml-3" />
        </span>
      </Button>
      <Button size="sm">
        Cash out (${session.money})! <BanknoteArrowUpIcon />
      </Button>
    </FadingBar>
  );
}
