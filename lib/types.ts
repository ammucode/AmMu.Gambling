/* eslint-disable @typescript-eslint/no-explicit-any */

export type Simplify<T> = T extends Date
  ? T
  : T extends any[]
    ? { [E in keyof T]: Simplify<T[E]> }
    : { [K in keyof T]: T[K] } & {};

export type MarkNonNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

export type Awaitable<T = void> = T | Promise<T>;

export type FlattenOnce<T extends readonly any[]> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends readonly any[]
    ? [...Head, ...FlattenOnce<Tail>]
    : []
  : [];

export type Flatten<T extends readonly any[]> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends readonly any[]
    ? [...Flatten<Head>, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : [];

export type CreateDeepMutable<T> = {
  -readonly [P in keyof T]: CreateDeepMutable<T[P]>;
};

// `null` and `undefined` are treated uniquely in the built-in join method, in a way that differs from the default `toString` that would result in the type `${undefined}`. That's why we need to handle it specifically with this helper.
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join#description
export type NullishCoalesce<
  Value extends JoinableItem,
  Fallback extends string,
> = Value extends undefined | null ? NonNullable<Value> | Fallback : Value;

// The builtin `join` method supports all these natively in the same way that typescript handles them so we can safely accept all of them.
type JoinableItem = string | number | bigint | boolean | undefined | null;

// Join an array of strings and/or numbers using the given string as a delimiter.
export type Join<
  Items extends readonly JoinableItem[],
  Delimiter extends string,
> = Items extends readonly []
  ? ''
  : Items extends readonly [JoinableItem?]
    ? `${NullishCoalesce<Items[0], ''>}`
    : Items extends readonly [
          infer First extends JoinableItem,
          ...infer Tail extends readonly JoinableItem[],
        ]
      ? `${NullishCoalesce<First, ''>}${Delimiter}${Join<Tail, Delimiter>}`
      : Items extends readonly [
            ...infer Head extends readonly JoinableItem[],
            infer Last extends JoinableItem,
          ]
        ? `${Join<Head, Delimiter>}${Delimiter}${NullishCoalesce<Last, ''>}`
        : string;
