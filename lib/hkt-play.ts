import {
  GameTable,
  GameTables,
  GameTablesKey,
} from '@/convex/functions/schema';
import {
  Arg0,
  Call1,
  Pipe,
  RetType,
  Sig,
  TArg,
  TolerantParams,
  TypeArgs,
  TypeLambda,
  TypeLambda1,
  TypeLambdaG,
} from 'hkt-core';
import { GamePathString, GamePathStrings } from './games/games';
import { List, ObjectHKTs } from './hkt';

type GameTableName = GameTable['tableName'];
type GameTableByName<Name extends GameTableName> = Simplify<
  GameTable & { tableName: Name }
>;

interface PathToFunctorArgsLambda extends TypeLambda<
  [path: GameTablesKey],
  [GameTable, GameTableName, GamePathString]
> {
  return: _PathToFunctorArgsLambda<Arg0<this>>;
}
type _PathToFunctorArgsLambda<Path extends GameTablesKey> = [
  GameTables[Path],
  GameTables[Path]['tableName'],
  Path,
];

interface PerGameFunctorTypeLambda<
  Ret extends readonly [PropertyKey, unknown],
> extends TypeLambda1<[GameTable, GameTableName, GamePathString], Ret> {
  // table: Arg0<this>[0];
  // tableName: Arg0<this>[1];
  // path: Arg0<this>[2];
}
interface MakeTables extends PerGameFunctorTypeLambda<
  [GameTableName, GameTable]
> {
  // return: [this["tableName"], this["table"]];
  return: [Arg0<this>[0]['tableName'], Arg0<this>[0]];
}

type PerGameFunctorPipe<
  F extends PerGameFunctorTypeLambda<[PropertyKey, unknown]>,
> = Pipe<
  GamePathStrings,
  List.Map$<PathToFunctorArgsLambda>,
  List.Map$<F>,
  ObjectHKTs.FromEntries
>;
type final = Sig<PerGameFunctorTypeLambda<RetType<MakeTables>>>;
type t = PerGameFunctorPipe<MakeTables>;

// type PerGameLambda = <In extends RetType<PathToFunctorArgsLambda>, OutK extends PropertyKey, OutV>(arg: In) => [OutK, OutV];
// type PerGameLambda = <Path extends GameTablesKey>(arg: Call1<PathToFunctorArgsLambda, Path>) => [PropertyKey, unknown];
type PerGameLambda = (
  arg: Call1<PathToFunctorArgsLambda, GameTablesKey>
) => [PropertyKey, unknown];
// interface InferLambda<F extends PerGameLambda> extends PerGameFunctorTypeLambda<F extends PerGameLambda> {

// }
// interface PerGameGenericLambda extends TypeLambdaG<[["F", PerGameLambda], ["OutK", PropertyKey], "OutV"]> {
// interface PerGameGenericLambda extends TypeLambdaG<["F", ["Tbl", GameTable], ["TblName", GameTableName], ["Path", GamePathString], ["OutK", PropertyKey], "OutV"]> {
interface PerGameGenericLambda extends TypeLambdaG<[['F', PerGameLambda]]> {
  signature: (
    // f: TArg<this, "F"> & ((arg: Call1<PathToFunctorArgsLambda, TArg<this, "Path">>) => [TArg<this, "OutK">, TArg<this, "OutV">])
    f: TArg<this, 'F'> // & (<Path extends GameTablesKey>(arg: Call1<PathToFunctorArgsLambda, Path>) => [PropertyKey, unknown])
    // ) => TypeLambda1<Call1<PathToFunctorArgsLambda, TArg<this, "Path">>, ReturnType<TArg<this, "F">>>;
  ) => TypeLambda1<
    Call1<PathToFunctorArgsLambda, GameTablesKey>,
    [PropertyKey, unknown]
  >;
  return: _PerGameGenericLambda<TArg<this, 'F'>>;
}
interface _PerGameGenericLambda<F extends PerGameLambda> extends TypeLambda1<
  Call1<PathToFunctorArgsLambda, GameTablesKey>,
  [PropertyKey, unknown]
> {
  return: ReturnType<F & ((arg: Arg0<this>) => ReturnType<F>)>;
  // return: F extends (arg: Arg0<this>) => [infer K extends PropertyKey, infer V]
  //   ? [K, V]
  //   : [PropertyKey, unknown];
}

// type _PerGameGenericLambda<F extends PerGameLambda, Path extends GamePathString> =
//   TypeLambda1<Call1<PathToFunctorArgsLambda, Path>, [PropertyKey, unknown]> & {
//     return: F extends (arg: Call1<PathToFunctorArgsLambda, Path>) => [infer K extends PropertyKey, infer V]
//       ? [K, V]
//       : [PropertyKey, unknown];
//   };

interface new_test<F extends PerGameLambda> extends TypeLambda1<
  GameTablesKey,
  [PropertyKey, unknown]
> {
  return: ReturnType<
    F & ((arg: Call1<PathToFunctorArgsLambda, Arg0<this>>) => ReturnType<F>)
  >;
  // return: F extends (arg: Arg0<this>) => [infer K extends PropertyKey, infer V]
  //   ? [K, V]
  //   : [PropertyKey, unknown];
}
const foo = <Path extends GamePathString>([tbl, name]: [
  GameTables[Path],
  GameTables[Path]['tableName'],
  Path,
]) => [name, tbl] as [GameTables[Path]['tableName'], GameTables[Path]];
type PGGLParams = TolerantParams<PerGameGenericLambda>;
type pgglfoo = typeof foo;
type pggltargs = TypeArgs<PerGameGenericLambda, { 0: pgglfoo }>;
type rawtest = ReturnType<
  typeof foo &
    ((
      arg: Call1<PathToFunctorArgsLambda, 'craps/easy'>
    ) => ReturnType<typeof foo<'craps/easy'>>)
>;
type rawtest_ = _PerGameGenericLambda<typeof foo>;
type rawtest_2 = Call1<rawtest_, Call1<PathToFunctorArgsLambda, 'craps/easy'>>;
type easyCrapsFunctorArgs = Call1<PathToFunctorArgsLambda, 'craps/easy'>;

// const bar = <Path extends GamePathString>([tbl, name]: [GameTables[Path], GameTables[Path]["tableName"], Path]) => [name, tbl] as const;
function bar<Path extends GamePathString>([tbl, name]: [
  GameTables[Path],
  GameTables[Path]['tableName'],
  Path,
]) {
  return [name, tbl] as const;
}
const f = bar([
  GameTables['craps/easy'],
  GameTables['craps/easy'].tableName,
  'craps/easy',
]);
type bart = typeof bar;
type rawext_test<Path extends GamePathString> = typeof bar<Path> extends (
  arg: easyCrapsFunctorArgs
) => infer R
  ? R
  : never;
type rawext_testec = rawext_test<'craps/easy'>;
type newtest = new_test<typeof foo>;
type newtest2 = Call1<newtest, 'craps/easy'>;
type test = _PerGameGenericLambda<pggltargs['~F']>;
type test2 = Pipe<
  GamePathStrings,
  List.Map$<PathToFunctorArgsLambda>,
  List.Map$<test>
>; //, ObjectHKTs.FromEntries>;
type PGGLMakeTable = Call1<PerGameGenericLambda, pgglfoo>;
type tgpipepggltest = Pipe<
  GamePathStrings,
  List.Map$<PathToFunctorArgsLambda>,
  List.Map$<PGGLMakeTable>
>; //, ObjectHKTs.FromEntries>;

// type GameTableFunctor = <Path extends GamePathString, Table extends GameTables[Path], FK extends string, FV>(tbl: Table, name: Table['tableName'], pathString: Path) => [FK,FV]
