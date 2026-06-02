export type Simplify<T> = T extends any[] | Date ? T : { [K in keyof T]: T[K] } & {};
export type MarkNonNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};