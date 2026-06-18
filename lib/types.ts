/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  If,
  IsEqual,
  IsLiteral,
  IsNever,
  PartialDeep,
  Primitive,
} from 'type-fest';

export type MyPartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? MyPartialDeep<T[P]> : T[P];
};
export type MyStrictPartialDeep<T, U extends MyPartialDeep<T>> = {
  [K in keyof U]: K extends keyof T
    ? U[K] extends PartialDeep<T[K]>
      ? StrictPartialDeep<T[K], U[K]>
      : U[K]
    : never;
};

export type StrictPartial<T, U extends Partial<T>> = U & {
  [K in keyof U]: K extends keyof T ? U[K] : never;
};
export type StrictPartialDeep<T, U extends PartialDeep<T>> = U & {
  [K in keyof U]: K extends keyof T
    ? U[K] extends PartialDeep<T[K]>
      ? StrictPartialDeep<T[K], U[K]>
      : U[K]
    : never;
};
// <T, U> = Partial<T> & {
//   [K in keyof U]: K extends keyof T ? U[K] : never;
// };

export type MySimplifyDeep<T> = T extends Date
  ? T
  : T extends any[]
    ? { [E in keyof T]: MySimplifyDeep<T[E]> }
    : { [K in keyof T]: T[K] } & {};

export type MarkNonNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

// export type Awaitable<T = void> = T | Promise<T>;

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

type LiteralDeepInner<T> =
  IsLiteral<T> extends true
    ? T
    : T extends []
      ? []
      : T extends [infer Head]
        ? [LiteralDeepInner<Head>]
        : T extends [infer Head, ...infer Tail]
          ? [LiteralDeepInner<Head>, ...LiteralDeepInner<Tail>]
          : T extends (infer U)[]
            ? LiteralDeepInner<U>[]
            : T extends object
              ? { [K in keyof T]: LiteralDeepInner<T[K]> }
              : 'not-a-literal';
export type IsLiteralDeep<T> = IsEqual<T, LiteralDeepInner<T>>;
export type LiteralDeep<T> = If<IsLiteralDeep<T>, T, never>;

export type Untag<T, Tag> = T extends infer T2 & Tag ? T2 : never;

export type UntagArray<T, P extends Primitive = Primitive> = P extends unknown
  ? Untag<T, P[]>
  : never;
export type MaybeUntagArray<T> = If<IsNever<UntagArray<T>>, T, UntagArray<T>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StripNoInfer<T> = T extends NoInfer<infer _> | infer Rest
  ? Rest
  : T;

export type ZipObject<
  K extends readonly PropertyKey[], 
  V extends readonly unknown[], 
  Obj = {}
> = K extends readonly [infer KHead, ...infer KTail extends readonly PropertyKey[]]
  ? V extends readonly [infer VHead, ...infer VTail]
    ? ZipObject<KTail, VTail, Obj & { [P in KHead & string]: VHead }>
    : Obj
  : Obj;



// // 1. A type helper to extract the [Key, Value] tuple type returned by the functor
// type FunctorOutput<
//   K extends PropertyKey,
//   V,
//   F extends (k: K, v: V) => readonly [PropertyKey, unknown]
// > = F extends (k: K, v: V) => readonly [infer NewKey extends PropertyKey, infer NewValue] 
//   ? { key: NewKey; val: NewValue } 
//   : never;

// // 2. The main mapping type that loops through the object and transforms keys/values
// type MapTable<
//   T extends Record<PropertyKey, unknown>, 
//   F extends (k: keyof T, v: T[keyof T]) => readonly [PropertyKey, unknown]
// > = {
//   [K in keyof T as FunctorOutput<K, T[K], F>["key"]]: FunctorOutput<K, T[K], F>["val"];
// };
// 1. A type helper to extract the [Key, Value] tuple type returned by the functor
type FunctorOutput<
  K, 
  V, 
  F extends (k: any, v: any) => readonly [any, any]
> = F extends (k: K, v: V) => readonly [infer NewKey, infer NewValue] 
  ? { key: NewKey & PropertyKey; val: NewValue } 
  : never;

// 2. The main mapping type that loops through the object and transforms keys/values
type MapTable<
  T extends Record<PropertyKey, any>, 
  F extends (k: any, v: any) => readonly [any, any]
> = {
  [K in keyof T as FunctorOutput<K, T[K], F>["key"]]: FunctorOutput<K, T[K], F>["val"];
};

type inTable = {
  str: "hi",
  int: 5
};
const functor = <K extends Exclude<PropertyKey, symbol>, V extends string|number>(k: K, v: V) => [`${k}_new_key` as const, `${v}_new_value` as const] as const;
type fout = FunctorOutput<keyof inTable, inTable[keyof inTable], typeof functor>;
type out = MapTable<inTable, typeof functor>;