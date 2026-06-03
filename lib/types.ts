/**
 * Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
 * @copyright from sindresorhus/type-fest
 */
// export type Simplify<T> = {
//   [KeyType in keyof T]: T[KeyType];
// } & {};
// /**
// * A simple extension of Simplify that will deeply traverse array elements.
// */
// export type SimplifyDeepArray<T> = T extends any[] ? {
//   [E in keyof T]: SimplifyDeepArray<T[E]>;
// } : Simplify<T>

export type Simplify<T> = T extends Date
  ? T
  : T extends any[]
    ? { [E in keyof T]: Simplify<T[E]> }
    : { [K in keyof T]: T[K] } & {};

export type MarkNonNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

export type Awaitable<T = void> = T | Promise<T>;
