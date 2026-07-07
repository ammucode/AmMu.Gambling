import { SkeletonOr } from '@/components/ui/skeleton';
import { FadingBar } from './fading-bar';
import { useGameBalance } from '@/hooks/games/use-game-balance';

interface IndicatorProps {
  title: string;
  amount: number;
}
function LastResultIndicatorRow({ title, amount }: IndicatorProps) {
  return (
    <span className="flex flex-row items-center justify-end">
      <span className="text-xs max-lg:text-[10px] font-light text-gray-400 uppercase">
        {title}:&nbsp;
      </span>
      <span className="text-sm max-lg:text-xs font-extrabold text-white">${amount}</span>
    </span>
  );
}
interface LastResultIndicatorProps {
  bet: number;
  won: number;
}
function LastResultIndicator({ bet, won }: LastResultIndicatorProps) {
  return (
    <p className="h-min w-24 max-lg:w-16 min-w-max align-middle leading-0 text-right">
      <LastResultIndicatorRow title="last bet" amount={bet} />
      <br />
      <LastResultIndicatorRow title="last win" amount={won} />
    </p>
  );
}

function BigMoneyIndicator({ title, amount }: IndicatorProps) {
  return (
    <p className="w-24 max-lg:w-16 min-w-max leading-0.5">
      <span className="text-sm max-lg:text-xs font-light text-gray-400 uppercase">
        {title}:
      </span>
      <br />
      <span className="text-lg max-lg:text-sm font-extrabold text-white uppercase">
        ${amount}
      </span>
    </p>
  );
}

export function MoneyStats() {
  const { gameBalance } = useGameBalance();

  return (
    <FadingBar className="ml-auto">
      <SkeletonOr
        render={
          gameBalance && <LastResultIndicator {...gameBalance.lastResult} />
        }
      />
      <SkeletonOr
        render={
          gameBalance && (
            <BigMoneyIndicator title="playable" amount={gameBalance.playable} />
          )
        }
      />
      <SkeletonOr
        render={
          gameBalance && (
            <BigMoneyIndicator title="bet" amount={gameBalance.totalBet} />
          )
        }
      />
    </FadingBar>
  );
}
