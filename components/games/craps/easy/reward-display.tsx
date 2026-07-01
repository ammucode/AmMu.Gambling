import { EasyCrapsBets } from '@/lib/games/craps/easy';

export interface EasyCrapsRewardDisplayProps {
  winnings: {
    total: number;
    breakdown: EasyCrapsBets;
  };
}
export function EasyCrapsRewardDisplay({
  winnings,
}: EasyCrapsRewardDisplayProps) {
  return (
    <div className="relative -top-36">
      you won! ${winnings.total}
      <br />
      {/* {JSON.stringify(winnings.breakdown)} */}
    </div>
  );
}
