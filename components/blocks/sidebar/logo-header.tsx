"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronsUpDown, HandCoins, Plus } from 'lucide-react';
import Link from 'next/link';

export function LogoHeader() {
  const { isMobile, open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href='/' />}
          className="group-data-[state=expanded]:px-2! group-data-[state=collapsed]:px-1! group-data-[state=collapsed]:pl-1.75! h-max bg-sidebar-primary/50 hover:bg-sidebar-primary/80"
        >
          <HandCoins className="size-5!" />
          <span className="text-base font-semibold ">AmMu Gambling</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
