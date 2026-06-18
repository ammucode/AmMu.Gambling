import { ArrayElement } from 'type-fest';

export const Points = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type Point = ArrayElement<typeof Points>;
