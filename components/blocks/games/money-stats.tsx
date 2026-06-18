import { SkeletonOr } from '@/components/ui/skeleton';
import { FadingBar } from './fading-bar';
import { useGameBalance } from '@/hooks/games/use-game-balance';

interface IndicatorProps {
  title: string;
  amount: number;
}
function LastResultIndicatorRow({ title, amount }: IndicatorProps) {
  return (
    <span className="">
      <span className="text-xs font-light text-gray-400 uppercase">
        {title}:&nbsp;
      </span>
      <span className="text-sm font-extrabold text-white">${amount}</span>
    </span>
  );
}
interface LastResultIndicatorProps {
  bet: number;
  won: number;
}
function LastResultIndicator({ bet, won }: LastResultIndicatorProps) {
  return (
    <p className="h-min w-24 min-w-max align-middle leading-0">
      <LastResultIndicatorRow title="last bet" amount={bet} />
      <br />
      <LastResultIndicatorRow title="last win" amount={won} />
    </p>
  );
}

function BigMoneyIndicator({ title, amount }: IndicatorProps) {
  return (
    <p className="w-24 min-w-max leading-0.5">
      <span className="text-sm font-light text-gray-400 uppercase">
        {title}:
      </span>
      <br />
      <span className="text-lg font-extrabold text-white uppercase">
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
