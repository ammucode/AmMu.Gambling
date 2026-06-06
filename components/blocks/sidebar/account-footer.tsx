'use client';

import { ChevronsUpDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import {
  AccountDropdownItems,
  GuestDropdownItems,
  LoadingDropdownItems,
  NoUserDropdownItems,
} from '../auth/sidebar-footer-items';
import { UserAvatar } from '../user/avatar';

export function AccountFooter({}) {
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
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
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
