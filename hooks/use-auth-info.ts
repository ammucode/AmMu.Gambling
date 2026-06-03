import { userPrivateInfo } from '@/convex/shared/models';
import { authClient } from '@/lib/convex/auth-client';
import { useCRPC } from '@/lib/convex/crpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useAuth } from 'kitcn/react';
import { use } from 'react';

export default function useAuthInfo() {
  const { hasSession, isLoading: sessionLoading } = useAuth();
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user;
  const hasUser = hasSession && !sessionLoading && !!sessionUser;
  const hasAccount = hasUser && !sessionUser.isAnonymous;
  const isGuest = hasUser && sessionUser.isAnonymous!;

  const crpc = useCRPC();

  const { data: userData, isLoading: userLoading } = useQuery(
    crpc.users.getOwnInfo.queryOptions(
      hasUser && sessionUser.username ? { username: sessionUser.username } : skipToken,
    )
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
