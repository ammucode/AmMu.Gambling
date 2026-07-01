import { Dice1Icon, Dice2Icon, Dice3Icon, Dice4Icon, Dice5Icon, Dice6Icon } from "lucide-react";
import { IntClosedRange } from "type-fest";

export function getDiceIcon(value: IntClosedRange<1,6>) {
  switch (value) {
    case 1: return Dice1Icon;
    case 2: return Dice2Icon;
    case 3: return Dice3Icon;
    case 4: return Dice4Icon;
    case 5: return Dice5Icon;
    case 6: return Dice6Icon;
  }
}

export function DiceComponent({value, size}: {value: IntClosedRange<1,6>, size?: number}) {
  const DiceIcon = getDiceIcon(value);
  return <DiceIcon size={size ?? 100} className={`size-${size??100}`} />
}