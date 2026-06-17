'use client';

import { Sparkles } from 'lucide-react';
import { AuthenticateFormCard } from './authenticate-dialog';
import useSignInAsGuest from '@hooks/use-signin-as-guest';
import { Button } from '@ui/button';
import { Card } from '@ui/card';
import { useRouter } from 'next/navigation';
import { Promisable } from 'type-fest';

export interface NoAccountBlockProps {
  onAuth?: () => Promisable<unknown>;
}
export function NoAccountBlock({ onAuth }: NoAccountBlockProps) {
  const signInAsGuestAsync = useSignInAsGuest({
    // refresh: true,
    onAuth
  });
  // const router = useRouter();

  return (
    <Card className="flex min-w-72 flex-col gap-6 sm:min-w-sm md:max-w-md">
      <AuthenticateFormCard
        // onAuth={() => router.refresh()}
        onAuth={onAuth}
        overrides={{
          title: 'You must have an account to play!',
          top: (
            <>
              <div className="mb-4 flex w-full flex-col items-center">
                <Button className="w-full py-6" onClick={signInAsGuestAsync}>
                  <Sparkles />
                  Play as guest!
                </Button>
              </div>
            </>
          ),
        }}
      />
    </Card>
  );
}
