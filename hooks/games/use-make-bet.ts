import { useCallback } from 'react';
import { ExtendsStrict, If, Simplify } from 'type-fest';

type DefaultBetArgs = {
  amount: number;
}
type BetArgs = DefaultBetArgs & Record<string, unknown>;
type RestArgs<Args extends BetArgs> = Simplify<Omit<Args, keyof DefaultBetArgs>>;
type IfHasRest<Args extends BetArgs, Then, Else> = If<ExtendsStrict<DefaultBetArgs,Args>, Else, Then>


export function useMakeBet<
  Args extends BetArgs,
  Ret,
  MinMaxArgs extends RestArgs<Args>,
>(
  callback: (input: Args) => Ret, 
  minMax?: {
    min?: number|((rest:MinMaxArgs)=>number|undefined),
    max?: number|((rest:MinMaxArgs)=>number|undefined)
  },
) {
  const {min,max} = minMax??{};
  const result = useCallback((...args: IfHasRest<Args, [number, RestArgs<Args>], [number]>) => {
    let [amount, rest] = args;
    const realMin = typeof min === "number" ? min : min?.(rest as MinMaxArgs);
    const realMax = typeof max === "number" ? max : max?.(rest as MinMaxArgs);
    if (realMin !== undefined && amount < realMin) amount = realMin;
    if (realMax !== undefined && amount > realMax) amount = realMax;
    return callback({ amount, ...rest} as Args);
  }, [callback]);
  return result as If<ExtendsStrict<RestArgs<Args>, MinMaxArgs>, typeof result, never>;
}
