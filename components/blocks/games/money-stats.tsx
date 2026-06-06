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

export interface MoneyStatsProps {
  playable: number;
  bet: number;
  lastResult?: LastResultIndicatorProps;
}
export function MoneyStats({
  playable,
  bet,
  lastResult = { bet: 0, win: 0 },
}: MoneyStatsProps) {
  return (
    <div className="flex flex-row items-center gap-2 bg-linear-to-r from-green-900/0 via-green-900/60 via-30% to-green-950 inset-shadow-sm inset-shadow-green-900/50">
      <LastResultIndicator {...lastResult} />
      <BigMoneyIndicator title="playable" amount={playable} />
      <BigMoneyIndicator title="bet" amount={bet} />
    </div>
  );
}
