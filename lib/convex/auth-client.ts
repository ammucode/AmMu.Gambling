import { createAuthClient } from 'better-auth/react';
import { convexClient } from 'kitcn/auth/client';
import { createAuthMutations } from 'kitcn/react';
import { anonymousClient, usernameClient } from "better-auth/client/plugins"
import { DefaultError, MutationFunction, useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL!,
  plugins: [convexClient(), usernameClient(), anonymousClient()],
});

export const {
  useSignInMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
} = createAuthMutations(authClient);

type AuthMutationOptions<TVariables = void> = UseMutationOptions<unknown, DefaultError, TVariables>;
type AuthMutationHook<TVariables = void> = (options?: Omit<AuthMutationOptions<TVariables>, 'mutationFn'>) => UseMutationResult<unknown, DefaultError, TVariables>;
type UserPass = {username: string, password: string};

export const useAnonymousSignInMutation: AuthMutationHook = (options) => {
  return useMutation(useSignInMutationOptions({ signInMethod: 'anonymous', ...options }) as AuthMutationOptions);
};

export const useSignUpMutation: AuthMutationHook<UserPass> = (options) => {
  const mutationOpts = useSignUpMutationOptions({
    ...options
  }) as AuthMutationOptions<UserPass>;
  const mutationVariableAdaptor = ({username, password}: UserPass) => ({
    email: `${username}@player.gambling.ammu.com`,
    name: username,
    password,
    username,
  });
  return useMutation({
    ...mutationOpts,
    mutationFn: async (variables: UserPass, context) => {
      return mutationOpts.mutationFn!(mutationVariableAdaptor(variables), context);
    },
  })
};

export const useSignInMutation: AuthMutationHook<UserPass> = (options) => {
  return useMutation(useSignInMutationOptions({ signInMethod: 'username', ...options }) as AuthMutationOptions<UserPass>);
};

export const useSignOutMutation: AuthMutationHook = (options) => {
  return useMutation(useSignOutMutationOptions({ ...options }) as AuthMutationOptions);
}