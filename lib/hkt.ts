/* eslint-disable @typescript-eslint/no-namespace */
import {
  Arg0,
  Arg1,
  Arg2,
  Call1W,
  Call2W,
  Param0,
  Param1,
  RetType,
  TArg,
  TypeLambda,
  TypeLambda1,
  TypeLambda2,
  TypeLambdaG,
} from 'hkt-core';
import { ValidTemplateLiteralType } from './types';

export namespace Any {
  /* NotExtend */
  export type NotExtend<T, U> = [T] extends [U] ? false : true;
  export interface NotExtend$<U> extends TypeLambda<[x: unknown], boolean> {
    return: NotExtend<Arg0<this>, U>;
  }
  export interface NotExtend$$ extends TypeLambda<
    [x: unknown, y: unknown],
    boolean
  > {
    return: NotExtend<Arg0<this>, Arg1<this>>;
  }
}

export namespace List {
  /* Filter */
  export type Filter<
    F extends TypeLambda1<TS[number], boolean>,
    TS extends unknown[],
  > = _Filter<F, TS>;
  type _Filter<F, TS, Acc extends unknown[] = []> = TS extends [
    infer Head,
    ...infer Tail,
  ]
    ? Call1W<F, Head> extends true
      ? _Filter<F, Tail, [...Acc, Head]>
      : _Filter<F, Tail, Acc>
    : Acc;
  export interface Filter$<
    F extends TypeLambda1<never, boolean>,
  > extends TypeLambda<[xs: Param0<F>[]], Param0<F>[]> {
    return: _Filter<F, Arg0<this>>;
  }
  export interface Filter$$ extends TypeLambdaG<['T']> {
    signature: (
      f: TypeLambda<[x: TArg<this, 'T'>], boolean>,
      xs: TArg<this, 'T'>[]
    ) => TArg<this, 'T'>[];
    return: _Filter<Arg0<this>, Arg1<this>>;
  }

  /* Map */
  export type Map<
    F extends TypeLambda1<TS[number]>,
    TS extends unknown[],
  > = _Map<F, TS>;
  type _Map<F, TS> = { [K in keyof TS]: Call1W<F, TS[K]> };
  export interface Map$<F extends TypeLambda1> extends TypeLambda<
    [xs: Param0<F>[]],
    RetType<F>[]
  > {
    return: _Map<F, Arg0<this>>;
  }
  export interface Map$$ extends TypeLambdaG<['T', 'U']> {
    signature: (
      f: TypeLambda<[x: TArg<this, 'T'>], TArg<this, 'U'>>,
      xs: TArg<this, 'T'>[]
    ) => TArg<this, 'U'>[];
    return: _Map<Arg0<this>, Arg1<this>>;
  }

  export type MapRO<
    F extends TypeLambda1<TS[number]>,
    TS extends readonly unknown[],
  > = _MapRO<F, TS>;
  type _MapRO<F, TS> = { [K in keyof TS]: Call1W<F, TS[K]> };
  export interface MapRO$<F extends TypeLambda1> extends TypeLambda<
    [xs: readonly Param0<F>[]],
    readonly RetType<F>[]
  > {
    return: _MapRO<F, Arg0<this>>;
  }
  export interface MapRO$$ extends TypeLambdaG<['T', 'U']> {
    signature: (
      f: TypeLambda<[x: TArg<this, 'T'>], TArg<this, 'U'>>,
      xs: readonly TArg<this, 'T'>[]
    ) => readonly TArg<this, 'U'>[];
    return: _MapRO<Arg0<this>, Arg1<this>>;
  }

  /* Reduce */
  export type Reduce<
    F extends TypeLambda2<never, TS[number]>,
    Init extends Param0<F>,
    TS extends unknown[],
  > = _Reduce<F, TS, Init>;
  type _Reduce<F, TS, Acc> = TS extends [infer Head, ...infer Tail]
    ? _Reduce<F, Tail, Call2W<F, Acc, Head>>
    : Acc;
  export interface Reduce$<
    F extends TypeLambda2,
    Init extends Param0<F>,
  > extends TypeLambda<[xs: Param1<F>[]], Param0<F>> {
    return: _Reduce<F, Arg0<this>, Init>;
  }
  export interface Reduce$$$ extends TypeLambdaG<['T', 'U']> {
    signature: (
      f: TypeLambda<
        [acc: TArg<this, 'U'>, x: TArg<this, 'T'>],
        TArg<this, 'U'>
      >,
      init: TArg<this, 'U'>,
      xs: TArg<this, 'T'>[]
    ) => TArg<this, 'U'>;
    return: _Reduce<Arg0<this>, Arg2<this>, Arg1<this>>;
  }

  /* Join */
  export type Join<Sep extends string, Strings extends string[]> = _Join<
    Sep,
    Strings
  >;
  type _Join<
    Sep extends string,
    Strings extends string[],
    Acc extends string = '',
  > = Strings extends [
    infer Head extends string,
    ...infer Tail extends string[],
  ]
    ? _Join<Sep, Tail, `${Acc}${Acc extends '' ? '' : Sep}${Head}`>
    : Acc;
  export interface Join$<Sep extends string> extends TypeLambda<
    [ss: string[]],
    string
  > {
    return: _Join<Sep, Arg0<this>>;
  }
  export interface Join$$ extends TypeLambda<
    [sep: string, strings: string[]],
    string
  > {
    return: _Join<Arg0<this>, Arg1<this>>;
  }
}

export namespace Str {
  /* Cap */
  export type Cap<S extends string> = Capitalize<S>;
  export interface Cap$ extends TypeLambda<[s: string], string> {
    return: Cap<Arg0<this>>;
  }

  /* Append */
  export interface Append<Suffix extends string> extends TypeLambda<[s: string], string> {
    return: `${Arg0<this>}${Suffix}`;
  }

  /* Prepend */
  export interface Prepend<Prefix extends string> extends TypeLambda<[s: string], string> {
    return: `${Prefix}${Arg0<this>}`;
  }

  /* ToString */
  export interface ToString extends TypeLambda1<ValidTemplateLiteralType, string> {
    return: `${Arg0<this>}`;
  }

  /* Length */
  export type Length<S extends string> = _Length<S>;
  type _Length<
    S extends string,
    Acc extends void[] = [],
  > = S extends `${string}${infer Tail}`
    ? _Length<Tail, [...Acc, void]>
    : Acc['length'];
  export interface Length$ extends TypeLambda<[s: string], number> {
    return: _Length<Arg0<this>>;
  }
}

// export interface Map extends TypeLambdaG<["T", "U"]> {
//   signature: (
//     f: TypeLambda<[x: TArg<this, "T">], TArg<this, "U">>,
//     xs: TArg<this, "T">[],
//   ) => TArg<this, "U">[];
//   return: _Map<Arg0<this>, Arg1<this>>;
// }
// type _Map<F, TS> = { [K in keyof TS]: Call1W<F, TS[K]> };
// export type MapBy<F extends TypeLambda1> = Call1<Curry<Map>, F>;

export namespace ObjectHKTs {
  type _Entries<Obj extends Record<PropertyKey, unknown>> = {
    [K in keyof Obj]: [K, Obj[K]];
  }[keyof Obj][];
  export interface Entries extends TypeLambdaG<
    [['T', Record<PropertyKey, unknown>]]
  > {
    signature: (
      entries: TArg<this, 'T'>
    ) => [keyof TArg<this, 'T'>, TArg<this, 'T'>[keyof TArg<this, 'T'>]];
    return: _Entries<Arg0<this>>;
  }

  type _PrettifyObject<O> = O extends infer U
    ? { [K in keyof U]: U[K] }
    : never;
  type _FromEntries<Entries extends readonly [PropertyKey, unknown][]> =
    _PrettifyObject<{
      [K in Entries[number][0]]: Extract<Entries[number], [K, unknown]>[1];
    }>;
  export interface FromEntries extends TypeLambdaG<[['K', PropertyKey], 'V']> {
    signature: (
      entries: readonly [TArg<this, 'K'>, TArg<this, 'V'>][]
    ) => Record<TArg<this, 'K'>, TArg<this, 'V'>>;
    return: _FromEntries<Arg0<this>>;
  }
}
