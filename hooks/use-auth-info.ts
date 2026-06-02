import { authClient } from "@/lib/convex/auth-client";
import { useAuth } from "kitcn/react";

export default function useAuthInfo() {
  const { hasSession, isLoading: authLoading } = useAuth();
  const {data: sessionData} = authClient.useSession();
  const user = sessionData?.user;
  const hasUser = !!user;
  const hasAccount = hasUser && user.isAnonymous;
  const isGuest = hasUser && user.isAnonymous;

  return {
    hasSession, authLoading,
    sessionData,
    user,
    hasUser, hasAccount, isGuest
  };
}