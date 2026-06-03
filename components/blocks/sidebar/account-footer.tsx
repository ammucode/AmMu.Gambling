'use client';

import {
  BadgeCheck,
  BadgeX,
  Bell,
  ChevronsUpDown,
  CircleQuestionMark,
  CreditCard,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import useAuthInfo from '@/hooks/use-auth-info';
import { userPrivateInfo } from '@/convex/shared/models';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnonymousSignInMutation } from '@/lib/convex/auth-client';
import { DialogTrigger } from '@/components/ui/dialog';
import { authDialogHandle } from '../auth/authenticate-dialog';
import {
  AccountDropdownItems,
  GuestDropdownItems,
  LoadingDropdownItems,
  NoUserDropdownItems,
} from '../auth/sidebar-footer-items';
import { UserAvatar } from '../user/avatar';

export function UserFooter({}) {
  const { isMobile } = useSidebar();

  const { authLoading, user, hasUser, isGuest } = useAuthInfo();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar loading={authLoading} user={user} />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar loading={authLoading} user={user} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {authLoading ? (
              <LoadingDropdownItems />
            ) : !hasUser ? (
              <NoUserDropdownItems />
            ) : isGuest ? (
              <GuestDropdownItems user={user!} />
            ) : (
              <AccountDropdownItems user={user!} />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
