import { createAuthClient } from 'better-auth/react';
import { convexClient } from 'kitcn/auth/client';
import {
  AuthMutationError,
  createAuthMutations,
  useAuthStore,
  useConvexQueryClient,
  useFetchAccessToken,
} from 'kitcn/react';
import { anonymousClient, usernameClient } from 'better-auth/client/plugins';
import {
  DefaultError,
  MutationFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { CRPCClientError } from 'kitcn/crpc';
import { clearAuthSessionFallback, toAuthMutationError } from './kitcn-mirror';
import { useCRPC } from './crpc';

const getBackendUrl = () => {
  // // return "http://10.0.0.84:3001";
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_SITE_URL!; // SSR Fallback

  const allowedURLs = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_DEV_NETWORK_SITE_URL
  ].filter(Boolean);

  // Example: Router maps subdomains dynamically to separate backend targets
  if (allowedURLs.includes(window.location.origin)) {
      return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL;
};

export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
  plugins: [convexClient(), usernameClient(), anonymousClient()],
});

export const {
  useSignInMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
} = createAuthMutations(authClient);

type AuthMutationOptions<TVariables = void> = UseMutationOptions<
  unknown,
  DefaultError,
  TVariables
>;
type AuthMutationHook<TVariables = void> = (
  options?: Omit<AuthMutationOptions<TVariables>, 'mutationFn'>
) => UseMutationResult<unknown, DefaultError, TVariables>;
type UserPass = { username: string; password: string };

export const usernameAvailableQueryOptions = (username: string) =>
  ({
    queryKey: ['better-auth', 'username', 'is-username-available', username],
    queryFn: async (client) => {
      const res = await authClient.isUsernameAvailable({ username });
      if (res?.error)
        throw new Error(res.error?.message, {
          cause: {
            code: res.error?.code,
            status: res.error?.status ?? 503,
            statusText: res.error?.statusText ?? 'INTERNAL ERROR',
          },
        });
      return res.data;
    },
  }) satisfies UseQueryOptions;

export const useAnonymousSignInMutation: AuthMutationHook = (options) => {
  return useMutation(
    useSignInMutationOptions({
      signInMethod: 'anonymous',
      ...options,
    }) as AuthMutationOptions,
  );
};

export const useSignUpMutation: AuthMutationHook<UserPass> = (options) => {
  const mutationOpts = useSignUpMutationOptions({
    ...options,
  }) as AuthMutationOptions<UserPass>;
  const mutationVariableAdaptor = ({ username, password }: UserPass) => ({
    email: `${username}@player.gambling.ammu.com`,
    name: username,
    password,
    username,
  });
  return useMutation({
    ...mutationOpts,
    mutationFn: async (variables: UserPass, context) => {
      return mutationOpts.mutationFn!(
        mutationVariableAdaptor(variables),
        context
      );
    },
  });
};

export const useSignInMutation: AuthMutationHook<UserPass> = (options) => {
  return useMutation(
    useSignInMutationOptions({
      signInMethod: 'username',
      ...options,
    }) as AuthMutationOptions<UserPass>
  );
};

export const useSignOutMutation: AuthMutationHook = (options) => {
  return useMutation(
    useSignOutMutationOptions({ ...options }) as AuthMutationOptions
  );
};

export const useDeleteAnonymousAccountMutation: AuthMutationHook = (
  options
) => {
  const authStoreApi = useAuthStore();
  const convexQueryClient = useConvexQueryClient();
  return useMutation({
    ...options,
    mutationFn: async () => {
      authStoreApi.set('isAuthenticated', false);
      convexQueryClient?.unsubscribeAuthQueries();
      const res = await authClient.deleteAnonymousUser();
      if (res?.error) {
        console.error(res);
        throw toAuthMutationError(res.error)
      };
      authStoreApi.set('token', null);
      authStoreApi.set('expiresAt', null);
      authStoreApi.set('sessionSyncGraceUntil', null);
      clearAuthSessionFallback();
      await convexQueryClient?.resetAuthQueries();
      return res;
    },
  });
};
