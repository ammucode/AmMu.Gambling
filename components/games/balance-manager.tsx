import { gameSessionInfo } from '@/convex/shared/models';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BalanceManagerProps {
  session: gameSessionInfo;
}
export function BalanceManager({ session }: BalanceManagerProps) {
  return (
    <Card className="mx-auto w-48 max-w-sm absolute top-10 left-10 p-1 bg-accent-foreground/30">
      <CardContent className='p-1 rounded-3xl'>
        <Collapsible className="rounded-2xl data-open:bg-muted-foreground/30" defaultOpen>
          <CollapsibleTrigger
            render={
              <Button variant="outline" className="w-full">
                Balance
                <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
              </Button>
            }
          />
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
            <div>
              Add more money?
            </div>
            <Button size="xs">Cash out!</Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
