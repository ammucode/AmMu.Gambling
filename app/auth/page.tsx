'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from 'kitcn/react';
import { useState } from 'react';
import {
  authClient,
  useAnonymousSignInMutation,
  useSignInMutation,
  useSignInMutationOptions,
  useSignOutMutation,
  useSignOutMutationOptions,
  useSignUpMutation,
  useSignUpMutationOptions,
} from '@/lib/convex/auth-client';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const { hasSession, isLoading } = useAuth();
  const authSession = authClient.useSession();
  const session = authSession.data;
  const user = session?.user ?? null;
  const hasUser = !!user;
  const hasSignedInUser = user && !user.isAnonymous;
  const isGuest = user && user.isAnonymous;
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signIn = useSignInMutation();
  const signUp = useSignUpMutation();
  const signOut = useSignOutMutation();
  const anonSignin = useAnonymousSignInMutation();

  const error = signIn.error ?? signUp.error ?? signOut.error ?? anonSignin.error;

  const errorMessage = error?.message;
  const isPending =
    signIn.isPending || signUp.isPending || signOut.isPending || anonSignin.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'signup') {
      signUp.mutate({
        username,
        password,
      });
      return;
    }

    signIn.mutate({
      username,
      password,
    });
  }

  if (isLoading && !hasSignedInUser) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md items-center px-6 py-16">
        <p className="text-sm text-muted-foreground">Loading auth…</p>
      </main>
    );
  }

  if (hasSignedInUser) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Signed in</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user?.name || user?.username || username}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.username || username}
          </p>
        </div>
        <button
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          disabled={isPending}
          onClick={() => signOut.mutate()}
          type="button"
        >
          {signOut.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Auth demo</p>
        {!hasUser
          ? <Button onClick={() => anonSignin.mutate()}>
            Continue as guest.
          </Button>
          : isGuest
          ? <p className="text-sm font-medium text-muted-foreground">Guest: {user.username}</p>
          : null
        }
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === 'signup' ? 'Create an account' : 'Sign in'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Minimal Better Auth wiring on top of the init baseline.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          autoComplete="username"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
          type="username"
          value={username}
        />
        <input
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          type="password"
          value={password}
        />
        <button
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? 'Working…'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <button
        className="text-left text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        type="button"
      >
        {mode === 'signin'
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>

      {errorMessage ? (
        <p className="text-sm text-destructive">{JSON.stringify(error)+error.message+error.stack}</p>
      ) : null}
    </main>
  );
}
