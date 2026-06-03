import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { userPrivateInfo } from '@/convex/shared/models';
import { useAnonymousSignInMutation, useDeleteAnonymousAccountMutation, useSignOutMutation } from '@/lib/convex/auth-client';
import { Sparkles, LogIn, BadgeCheck, BadgeX, LogOut } from 'lucide-react';
import { authDialogHandle as authenticateDialogHandle } from './authenticate-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { destructiveConfirmationDialogHandle } from '../dialogs/destructive-confirmation';
import { FieldLabel } from '@/components/ui/field';
import { UserAvatar } from '../user/avatar';

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
  const signInAsGuest = useAnonymousSignInMutation();

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={() => signInAsGuest.mutate()}>
        <Sparkles />
        Play as guest!
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DialogTrigger
          handle={authenticateDialogHandle}
          className={'flex items-center gap-2.5'}
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

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <DialogTrigger
          handle={authenticateDialogHandle}
          payload={{ defaultIsSignUp: true }}
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
            formId: "delete-guest",
            confirmText: "Delete Guest Account",
            onConfirm: deleteGuest.mutateAsync,
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
  return (
    <DropdownMenuGroup>
      <DropdownMenuItem variant="destructive">
        <DialogTrigger
          handle={destructiveConfirmationDialogHandle}
          payload={{
            formId: "logout",
            confirmText: "Log out",
            onConfirm: signOut.mutateAsync,
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
