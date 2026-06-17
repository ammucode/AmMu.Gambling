import { iHateNull } from '@/convex/lib/document';
import { authClient } from '@/lib/convex/auth-client';
import { useCRPC } from '@/lib/convex/crpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useAuth } from 'kitcn/react';
import { useEffect } from 'react';

export default function useAuthInfo() {
  const { hasSession, isLoading: sessionLoading } = useAuth();
  const { data: sessionData, refetch: refetchSession } =
    authClient.useSession();
  const sessionUser = sessionData?.user;
  const hasUser = hasSession && !sessionLoading && !!sessionUser;
  const hasAccount = hasUser && !sessionUser.isAnonymous;
  const isGuest = hasUser && sessionUser.isAnonymous!;

  const crpc = useCRPC();

  const { data: userData, isLoading: userLoading } = useQuery(
    crpc.users.me.queryOptions(hasUser ? undefined : skipToken)
  );

  useEffect(() => {
    refetchSession({
      query: { disableCookieCache: true, disableRefresh: true },
    });
  }, [hasSession, refetchSession]);

  // console.log({
  //   hasSession,
  //   sessionLoading,
  //   sessionData,
  //   sessionUser,
  //   hasUser,
  //   hasAccount,
  //   isGuest,
  //   userData,
  //   userLoading,
  // });

  return {
    hasSession,
    authLoading: sessionLoading || userLoading,
    // sessionData,
    // sessionUser,
    user: iHateNull(userData),
    hasUser,
    hasAccount,
    isGuest,
  };
}
