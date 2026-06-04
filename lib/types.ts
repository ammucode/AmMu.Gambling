

export type Simplify<T> = T extends Date
  ? T
  : T extends any[]
    ? { [E in keyof T]: Simplify<T[E]> }
    : { [K in keyof T]: T[K] } & {};

export type MarkNonNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

export type Awaitable<T = void> = T | Promise<T>;
