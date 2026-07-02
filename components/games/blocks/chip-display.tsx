import { ChipDenomination, ChipDenominations } from '@/lib/games/chips';
import { Chip } from '../chip';

export interface ChipDisplayProps {
  activeDenom: ChipDenomination;
  className?: string;
}
export function ChipDisplay({ activeDenom, className }: ChipDisplayProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      {ChipDenominations.map((chip) => {
        return (
          <Chip
            key={chip}
            value={chip}
            highlight={activeDenom === chip}
            className={className}
          />
        );
      })}
    </div>
  );
}
