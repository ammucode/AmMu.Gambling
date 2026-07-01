/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import {
  If,
  IsEqual,
  IsLiteral,
  IsNever,
  PartialDeep,
  Primitive,
} from 'type-fest';

export type BuiltIns = Primitive | void | Date | RegExp;
export type NonRecursiveType =
  | BuiltIns
  | Function
  | (new (...arguments_: any[]) => unknown)
  | Promise<unknown>;
export type ValidTemplateLiteralType =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

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
  Obj = object,
> = K extends readonly [
  infer KHead,
  ...infer KTail extends readonly PropertyKey[],
]
  ? V extends readonly [infer VHead, ...infer VTail]
    ? ZipObject<KTail, VTail, Obj & { [P in KHead & string]: VHead }>
    : Obj
  : Obj;

export type AnyFieldValueOf<Obj> = Obj extends NonRecursiveType
  ? Obj
  : Obj extends object
    ? AnyFieldValueOf<Obj[keyof Obj]>
    : Obj;

export type ReplaceTypeDeep<Within, From, To> = Within extends unknown
  ? Within extends From
    ? To
    : Within extends NonRecursiveType
      ? Within
      : Within extends unknown[]
        ? { [I in keyof Within]: ReplaceTypeDeep<Within[I], From, To> }
        : { [K in keyof Within]: Within[K] } & {}
  : never;

export type PickByKeyDeep<T, Key extends PropertyKey> = T extends unknown
  ? T extends NonRecursiveType
    ? T
    : T extends unknown[]
      ? { [I in keyof T]: PickByKeyDeep<T[I], Key> }
      : T extends object
        ? { [K in keyof T]: K extends Key ? T[K] : never } & {}
        : T
  : never;
