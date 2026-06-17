import { createAuthClient } from 'better-auth/react';
import { convexClient } from 'kitcn/auth/client';
import {
  createAuthMutations,
  useAuthStore,
  useConvexQueryClient,
} from 'kitcn/react';
import { anonymousClient, usernameClient } from 'better-auth/client/plugins';
import {
  DefaultError,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { clearAuthSessionFallback, toAuthMutationError } from './kitcn-mirror';

const getBackendUrl = () => {
  // // return "http://10.0.0.84:3001";
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_SITE_URL!; // SSR Fallback

  const allowedURLs = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_DEV_NETWORK_SITE_URL,
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
type ProvidableAuthMutationOptions<TVariables = void> = Omit<
  AuthMutationOptions<TVariables>,
  'mutationFn'
>;
type AuthMutationHook<TVariables = void> = (
  options?: ProvidableAuthMutationOptions<TVariables>
) => UseMutationResult<unknown, DefaultError, TVariables>;
type UserPass = { username: string; password: string };

export const usernameAvailableQueryOptions = (username: string) =>
  ({
    queryKey: ['better-auth', 'username', 'is-username-available', username],
    queryFn: async () => {
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

function useExtraOptions<TVariables = void>(
  options?: ProvidableAuthMutationOptions<TVariables>
): ProvidableAuthMutationOptions<TVariables> {
  // const qc = useQueryClient();
  const convexQC = useConvexQueryClient();
  // const authStore = useAuthStore();

  return {
    onSettled: async (data, error, variables, onMutateResult, context) => {
      // await qc.invalidateQueries({predicate: (query) => {
      //   const auth = query.meta?.authType ?? '';
      //   const isAuthQuery = auth === 'optional' || auth === 'required';
      //   // if (isAuthQuery)
      //   //   console.log(`invalidate auth query: ${JSON.stringify(query.queryKey)}`);
      //   return isAuthQuery;
      // }});
      // console.log('convexQC', convexQC);
      // console.log('authStore', authStore);
      await convexQC?.resetAuthQueries();
      // if (!authStore.getIsAuthenticated()) {
      //   console.log("CLEAR OLD SESSIONS")
      //   void await authClient.revokeSessions();
      // }
      return await options?.onSettled?.(
        data,
        error,
        variables,
        onMutateResult,
        context
      );
    },
  };
}

export const useAnonymousSignInMutation: AuthMutationHook = (options) => {
  return useMutation(
    useSignInMutationOptions({
      signInMethod: 'anonymous',
      ...options,
      ...useExtraOptions(options),
    }) as AuthMutationOptions
  );
};

export const useSignUpMutation: AuthMutationHook<UserPass> = (options) => {
  const mutationOpts = useSignUpMutationOptions({
    ...options,
    ...useExtraOptions(options),
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
      ...useExtraOptions(options),
    }) as AuthMutationOptions<UserPass>
  );
};

export const useSignOutMutation: AuthMutationHook = (options) => {
  return useMutation(
    useSignOutMutationOptions({
      ...options,
      ...useExtraOptions(options),
    }) as AuthMutationOptions
  );
};

export const useDeleteAnonymousAccountMutation: AuthMutationHook = (
  options
) => {
  const authStoreApi = useAuthStore();
  const convexQueryClient = useConvexQueryClient();
  return useMutation({
    ...options,
    ...useExtraOptions(options),
    mutationFn: async () => {
      authStoreApi.set('isAuthenticated', false);
      convexQueryClient?.unsubscribeAuthQueries();
      const res = await authClient.deleteAnonymousUser();
      if (res?.error) {
        console.error(res);
        throw toAuthMutationError(res.error);
      }
      authStoreApi.set('token', null);
      authStoreApi.set('expiresAt', null);
      authStoreApi.set('sessionSyncGraceUntil', null);
      clearAuthSessionFallback();
      return res;
    },
  });
};
