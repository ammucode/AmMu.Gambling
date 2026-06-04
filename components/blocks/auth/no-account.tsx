'use client';

import { DialogTrigger } from '@/components/ui/dialog';
import { LogIn, Sparkles } from 'lucide-react';
import { authDialogHandle, AuthenticateFormCard } from './authenticate-dialog';
import useSignInAsGuest from '@/hooks/use-signin-as-guest';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export function NoAccountBlock() {
  const signInAsGuestAsync = useSignInAsGuest({async: true, asyncRefresh: true});
  const router = useRouter();

  return (
    <Card className="flex flex-col gap-6 min-w-72 sm:min-w-sm md:max-w-md">
      <AuthenticateFormCard
        onAuth={() => router.refresh()}
        overrides={{
          title: "You must have an account to play!",
          top: (<>
            <div className='w-full mb-4 flex flex-col items-center'>
              <Button className="w-full py-6" onClick={signInAsGuestAsync}>
                <Sparkles />
                Play as guest!
              </Button>
            </div>
          </>),
        }}
      />
    </Card>
  );
}
