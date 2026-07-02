import { RollDiceResult } from '@/lib/games/simulation';
import { DiceComponent, DieComponent } from '../../dice';
import { Sum } from 'type-fest';
import { sum } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface RollHistoryProps {
  lastRoll?: RollDiceResult<2>;
  history: RollDiceResult<2>[];
}
export function RollHistory({ lastRoll, history }: RollHistoryProps) {
  return (
    <div className="flex h-full max-h-full min-h-0 w-full max-w-full min-w-0 flex-row gap-1 rounded-md bg-black/40 px-2 inset-shadow-sm inset-shadow-black/70">
      <div className="my-auto flex h-min w-1/10 min-w-fit flex-row items-center justify-center gap-0.5 p-0.5">
        {lastRoll ? (
          <>
            <p className="mr-0.5 h-6 w-6 rounded-xs text-center align-middle ring-1 md:ring-2">
              {sum(lastRoll)}
            </p>
            <DiceComponent roll={lastRoll} size={32} />
          </>
        ) : null}
      </div>
      <Separator orientation="vertical" />
      <div className="flex w-full max-w-full flex-row items-center gap-1.5 overflow-x-scroll pl-0.5">
        {history.map((roll, i) => (
          <div
            key={i}
            className="flex h-max flex-col items-center rounded-sm bg-gray-900 py-0.5 inset-shadow-sm inset-shadow-black/50"
          >
            <div className="flex flex-row items-center gap-0.5 p-0.5">
              <DiceComponent roll={roll} size={16} />
            </div>
            <p className="text-center align-middle text-xs">{sum(roll)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
