import { MutationFunction, useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useGamePath } from "./use-game-path";
import { useGameSession } from "./use-game-session";
import { useCRPC } from "@/lib/convex/crpc";
import { gameSessionInfo } from "@/convex/shared/models";
import { useCallback } from "react";
import { gameMutation } from "@/convex/lib/crpc-games";
import { MutationProcedureBuilder } from "kitcn/server";
import { unknown } from "better-auth";
import { z } from "zod";
import { Simplify } from "type-fest";

type gameMutationParams = z.infer<typeof gameMutation extends MutationProcedureBuilder<unknown, unknown, object, infer TInput, z.ZodTypeAny, object> ? TInput : never>;

export function useGameMutation<
  MutationOpts extends UseMutationOptions<unknown, unknown, gameMutationParams>,
  // RealMutationOpts extends MutationOpts extends UseMutationOptions<
  //   infer Data,
  //   infer Error,
  //   infer Params extends gameMutationParams,
  //   infer OnMutateResult
  //   > 
  //   ? UseMutationOptions<Data, Error, Params, OnMutateResult>
  //   : never
>(
  gameSession: gameSessionInfo,
  mutationOpts: MutationOpts,// & NoInfer<RealMutationOpts>
) {
  type MutConfig = MutationOpts extends UseMutationOptions<infer Data, infer Error, infer Params extends gameMutationParams, infer OnMutateResult> ? {
    data: Data,
    error: Error,
    params: Params,
    onMutResult: OnMutateResult
  } : never;
  // const realMutationOpts = mutationOpts as unknown as RealMutationOpts;
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const {mutate,mutateAsync} = useMutation({
    ...mutationOpts,
    onSettled: async (data, error, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries(
        crpc.games.balance.info.staticQueryOptions({ sessionKey: gameSession.sessionKey })
      );
      await mutationOpts?.onSettled?.(data, error, variables, onMutateResult, context);
    },
  }) as UseMutationResult<MutConfig["data"], MutConfig["error"], MutConfig["params"], MutConfig["onMutResult"]>;

  // type params = Omit<Parameters<typeof mutate>[0], 'path'|'sessionKey'>
  type params = Simplify<Omit<Parameters<typeof mutate>[0], keyof gameMutationParams>>;
  // type params = Omit<Params, 'path'|'sessionKey'>

  return useCallback((params: params) => {
    return mutateAsync({
      sessionKey: gameSession.sessionKey,
      ...params
    });
  }, [gameSession, mutate]);
  // return mutate// as MutationFunction<unknown, FullParams>;
}