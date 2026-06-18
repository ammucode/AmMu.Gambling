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
        {title}:{' '}
      </span>
      <span className="text-sm font-extrabold text-white">${amount}</span>
    </span>
  );
}
interface LastResultIndicatorProps {
  bet: number;
  win: number;
}
function LastResultIndicator({ bet, win }: LastResultIndicatorProps) {
  return (
    <p className="h-min w-24 min-w-max align-middle leading-0">
      <LastResultIndicatorRow title="last bet" amount={bet} />
      <br />
      <LastResultIndicatorRow title="last win" amount={win} />
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
  const { playable, totalBet, lastResultBet, lastResultWon } = useGameBalance();
  return (
    <FadingBar className="ml-auto">
      <LastResultIndicator bet={lastResultBet} win={lastResultWon} />
      <BigMoneyIndicator title="playable" amount={playable} />
      <BigMoneyIndicator title="bet" amount={totalBet} />
    </FadingBar>
  );
}
