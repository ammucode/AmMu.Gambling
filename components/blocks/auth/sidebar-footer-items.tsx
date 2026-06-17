'use client';

import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@ui/skeleton';
import { userPrivateInfo } from '@/convex/shared/models';
import {
  useDeleteAnonymousAccountMutation,
  useSignOutMutation,
} from '@/lib/convex/auth-client';
import { Sparkles, LogIn, BadgeCheck, BadgeX, LogOut } from 'lucide-react';
import { authDialogHandle } from './authenticate-dialog';
import { DialogTrigger } from '@ui/dialog';
import { destructiveConfirmationDialogHandle } from '../dialogs/destructive-confirmation';
import { UserAvatar } from '../user/avatar';
import useSignInAsGuest from '@hooks/use-signin-as-guest';
import { useRouter } from 'next/navigation';

export function LoadingDropdownItems() {
  return (
    <DropdownMenuGroup>
      {[1, 2, 3].map((_, i) => (
        <DropdownMenuItem key={i} disabled={true}>
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-30" />
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
}

export function NoUserDropdownItems() {
  const signInAsGuestAsync = useSignInAsGuest({
    async: true,
    refresh: true,
  });
  const router = useRouter();
  return (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={signInAsGuestAsync}>
        <Sparkles />
        Play as guest!
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DialogTrigger
          handle={authDialogHandle}
          className={'flex items-center gap-2.5'}
          payload={{
            onAuth: () => router.refresh(),
          }}
        >
          <LogIn />
          Log In / Sign Up!
        </DialogTrigger>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
}

export function GuestDropdownItems({ user }: { user: userPrivateInfo }) {
  const deleteGuest = useDeleteAnonymousAccountMutation();
  const router = useRouter();

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <DialogTrigger
          handle={authDialogHandle}
          payload={{
            defaultIsSignUp: true,
            onAuth: () => router.refresh(),
          }}
          className={'flex items-center gap-2.5'}
        >
          <BadgeCheck />
          Create account / Log In!
        </DialogTrigger>
      </DropdownMenuItem>
      <DropdownMenuItem variant="destructive">
        <DialogTrigger
          handle={destructiveConfirmationDialogHandle}
          payload={{
            formId: 'delete-guest',
            confirmText: 'Delete Guest Account',
            onConfirm: async () => (
              await deleteGuest.mutateAsync(),
              router.refresh()
            ),
            children: !!user ? <UserAvatar user={user} /> : null,
          }}
          className={'flex items-center gap-2.5'}
        >
          <BadgeX />
          Clear Guest Account
        </DialogTrigger>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
}

export function AccountDropdownItems({ user }: { user: userPrivateInfo }) {
  const signOut = useSignOutMutation();
  const router = useRouter();

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem variant="destructive">
        <DialogTrigger
          handle={destructiveConfirmationDialogHandle}
          payload={{
            formId: 'logout',
            confirmText: 'Log out',
            onConfirm: async () => (
              await signOut.mutateAsync(),
              router.refresh()
            ),
            children: !!user ? <UserAvatar user={user} /> : null,
          }}
          className={'flex items-center gap-2.5'}
        >
          <LogOut />
          Log out
        </DialogTrigger>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
}
