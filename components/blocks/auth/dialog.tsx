import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useAuthInfo from "@/hooks/use-auth-info";
import { authClient, useAnonymousSignInMutation, useSignInMutation, useSignOutMutation, useSignUpMutation } from "@/lib/convex/auth-client";
import { useAuth } from "kitcn/react";
import { useState } from "react";


interface AuthDialogContentProps {
  close: () => void;
}
export function AuthDialogContent({close}: AuthDialogContentProps) {
  const { authLoading, hasUser, hasAccount, isGuest} = useAuthInfo();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signIn = useSignInMutation();
  const signUp = useSignUpMutation();
  const signInAsGuest = useAnonymousSignInMutation();

  return <DialogContent >

  </DialogContent>
}

interface AuthDialogProps {
  children: React.ReactElement;
}
export default function AuthDialog({children}: AuthDialogProps) {
  const [open, setOpen] = useState(false);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={children} />
    <AuthDialogContent close={() => setOpen(false)} />
  </Dialog>
}