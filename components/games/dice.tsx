import {
  Dice1Icon,
  Dice2Icon,
  Dice3Icon,
  Dice4Icon,
  Dice5Icon,
  Dice6Icon,
} from 'lucide-react';
import { IntClosedRange } from 'type-fest';

const diceIcons = {
  1: Dice1Icon,
  2: Dice2Icon,
  3: Dice3Icon,
  4: Dice4Icon,
  5: Dice5Icon,
  6: Dice6Icon,
} as const;

export function DieComponent({
  value,
  size,
}: {
  value: IntClosedRange<1, 6>;
  size?: number;
}) {
  const DiceIcon = diceIcons[value];
  return <DiceIcon size={size ?? 100} className={`size-${size ?? 100}`} />;
}

export function DiceComponent({
  roll,
  size,
}: {
  roll: [IntClosedRange<1, 6>, ...IntClosedRange<1, 6>[]];
  size: number;
}) {
  return (
    <>
      {roll.map((diceVal, i) => (
        <DieComponent key={i} value={diceVal} size={size} />
      ))}
    </>
  );
}
