import { ArrayValues } from 'type-fest';

export const ChipDenominations = [1, 2, 5, 10, 20, 50] as const;
export type ChipDenomination = ArrayValues<typeof ChipDenominations>;
