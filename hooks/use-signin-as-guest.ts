import { useAnonymousSignInMutation } from '@/lib/convex/auth-client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function useSignInAsGuest<Async extends boolean = false>({
  async,
  asyncRefresh,
}: {
  async?: Async;
  asyncRefresh?: Async extends true ? boolean : never;
} = {}): () => Async extends true ? Promise<void> : void {
  const router = useRouter();
  const signInAsGuest = useAnonymousSignInMutation();

  const sync = useCallback(() => signInAsGuest.mutate(), [signInAsGuest]);
  const async_ = useCallback(async () => {
    await signInAsGuest.mutateAsync();
    if (asyncRefresh) router.refresh();
  }, [signInAsGuest, asyncRefresh, router]);

  return (async ? async_ : sync) as () => Async extends true
    ? Promise<void>
    : void;
}
