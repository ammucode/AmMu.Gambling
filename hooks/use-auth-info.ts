import { authClient } from '@/lib/convex/auth-client';
import { useCRPC } from '@/lib/convex/crpc';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'kitcn/react';

export default function useAuthInfo() {
  const { hasSession, isLoading: sessionLoading } = useAuth();
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user;
  const hasUser = hasSession && !sessionLoading && !!sessionUser;
  const hasAccount = hasUser && !sessionUser.isAnonymous;
  const isGuest = hasUser && sessionUser.isAnonymous!;

  const crpc = useCRPC();

  const { data: userData, isLoading: userLoading } = useQuery(
    crpc.users.me.queryOptions()
  );

  return {
    hasSession,
    authLoading: sessionLoading || userLoading,
    // sessionData,
    user: userData ?? undefined,
    hasUser,
    hasAccount,
    isGuest,
  };
}
