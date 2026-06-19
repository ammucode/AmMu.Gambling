import { Arg0, Call1, TypeLambda1 } from 'hkt-core';

// 1. Define the structural shape of your generic step function
export interface GenericStep {
  <T>(value: T): unknown;
}

// 2. An HKT that extracts the mapping logic from a GenericStep
export interface InferLambda<F extends GenericStep> extends TypeLambda1 {
  return: ReturnType<F & (<T extends Arg0<this>>(value: T) => unknown)>;
}



export function pipe<A, F extends GenericStep>(
  value: A, 
  step: F
): Call1<InferLambda<F>, A> {
  return step(value) as any;
}

interface StringifyLambda extends TypeLambda1 {
  return: `Result: ${Extract<Arg0<this>, string | number>}`;
}

// Define your runtime logic using a standard generic function
const stringifyStep = <T>(value: T) => `Result: ${value}` as const;

// The call site infers the TypeLambda implicitly!
const result = pipe("Hello World" as const, stringifyStep);

// Type of 'result' is strictly inferred by hkt-core as: "Result: Hello World"
console.log(result); // Output: "Result: Hello World"

const numResult = pipe(42, stringifyStep);
// Type of 'numResult' is strictly inferred as: "Result: 42"
