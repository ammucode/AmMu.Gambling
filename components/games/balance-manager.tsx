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

export interface BalanceManagerProps {
  balance: number;
  session: gameSessionInfo;
}
export function BalanceManager({ balance, session }: BalanceManagerProps) {
  // const
  return (
    <Card className="absolute top-10 left-10 z-10 mx-auto w-56 max-w-sm bg-accent-foreground/30 p-1">
      <CardContent className="rounded-3xl p-1">
        <Collapsible
          className="rounded-2xl data-open:bg-muted-foreground/30"
          defaultOpen
        >
          <CollapsibleTrigger
            render={
              <Button
                variant="outline"
                className="flex w-full flex-row justify-between"
              >
                <span>Account Balance</span>
                <span className="flex flex-row items-center">
                  ${balance}
                  <BanknoteArrowDownIcon className="ml-3" />
                </span>
              </Button>
            }
          />
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
            <div>Add more money?</div>
            <Button size="sm">
              Cash out! <BanknoteArrowUpIcon />
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
