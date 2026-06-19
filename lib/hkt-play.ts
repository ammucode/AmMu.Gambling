// 1. A utility type that instantiates the generic function with the provided argument types
type InferGenericReturn<
  Fn extends (...args: any[]) => any, 
  Args extends any[]
> = Fn extends (...args: Args) => infer R ? R : never;

// --- Example Usage ---

// A generic function that wraps an input
type MyGenericFn = <T>(input: T) => { data: T; timestamp: number };

// Pass both the function AND the target argument type as generic parameters
type ResultWithNumber = InferGenericReturn<MyGenericFn, [number]>;
// Result: { data: number; timestamp: number; }

type ResultWithString = InferGenericReturn<MyGenericFn, [string]>;
// Result: { data: string; timestamp: number; }