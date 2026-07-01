import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useCRPC } from '@/lib/convex/crpc';
import { gameSessionInfo } from '@/convex/shared/models';
import { useCallback } from 'react';
import { gameMutation } from '@/convex/lib/crpc-games';
import { MutationProcedureBuilder } from 'kitcn/server';
import z from 'zod';
import { EmptyObject, Simplify } from 'type-fest';

type gameMutationParams = z.infer<
  typeof gameMutation extends MutationProcedureBuilder<
    unknown,
    unknown,
    object,
    infer TInput,
    z.ZodTypeAny,
    object
  >
    ? TInput
    : never
>;

export function useGameMutation<
  MutationOpts extends UseMutationOptions<unknown, unknown, gameMutationParams>,
>(gameSession: gameSessionInfo, mutationOpts: MutationOpts) {
  type MutConfig =
    MutationOpts extends UseMutationOptions<
      infer Data,
      infer Error,
      infer Params extends gameMutationParams,
      infer OnMutateResult
    >
      ? {
          data: Data;
          error: Error;
          params: Params;
          onMutResult: OnMutateResult;
        }
      : never;
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...mutationOpts,
    onSettled: async (data, error, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries(
        crpc.games.balance.info.staticQueryOptions({
          sessionKey: gameSession.sessionKey,
        })
      );
      await mutationOpts?.onSettled?.(
        data,
        error,
        variables,
        onMutateResult,
        context
      );
    },
  }) as UseMutationResult<
    MutConfig['data'],
    MutConfig['error'],
    MutConfig['params'],
    MutConfig['onMutResult']
  >;

  type MutationVariables = Simplify<
    Omit<Parameters<(typeof mutation)['mutate']>[0], keyof gameMutationParams>
  >;
  type CallbackInput =
    | MutationVariables
    | (MutationVariables extends EmptyObject ? void : never);

  const mutate = useCallback(
    (variables: CallbackInput) => {
      return mutation.mutate({
        sessionKey: gameSession.sessionKey,
        ...variables,
      });
    },
    [gameSession, mutation]
  );
  const mutateAsync = useCallback(
    (variables: CallbackInput) => {
      return mutation.mutateAsync({
        sessionKey: gameSession.sessionKey,
        ...variables,
      });
    },
    [gameSession, mutation]
  );

  return {
    ...mutation,
    mutate,
    mutateAsync,
  };
}

export function useGameMutationCallback<
  MutationOpts extends UseMutationOptions<unknown, unknown, gameMutationParams>,
>(gameSession: gameSessionInfo, mutationOpts: MutationOpts) {
  const { mutateAsync } = useGameMutation(gameSession, mutationOpts);

  return mutateAsync;
}
