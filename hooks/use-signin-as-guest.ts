import { useAnonymousSignInMutation } from '@/lib/convex/auth-client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Promisable } from 'type-fest';

export default function useSignInAsGuest({
  refresh,
  onAuth,
}: {
  refresh?: boolean;
  onAuth?: () => Promisable<unknown>;
} = {}) {
  const router = useRouter();
  const signInAsGuest = useAnonymousSignInMutation();

  return useCallback(async () => {
    await signInAsGuest.mutateAsync(undefined, {
      onSettled: async (_, error) => {
        console.log();
        if (error === null) await onAuth?.();
      },
    });
    if (refresh) router.refresh();
  }, [signInAsGuest, refresh, router, onAuth]);
}
