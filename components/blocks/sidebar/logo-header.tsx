'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { HandCoins } from 'lucide-react';
import Link from 'next/link';

export function LogoHeader() {
  const { open, setOpen, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={
            <Link
              href={open ? '/' : ''}
              onClick={() => (open ? setOpenMobile(false) : setOpen(true))}
            />
          }
          className="h-max bg-sidebar-primary/50 group-data-[state=collapsed]:px-1! group-data-[state=collapsed]:pl-1.75! group-data-[state=expanded]:px-2! hover:bg-sidebar-primary/80"
        >
          <HandCoins className="size-5!" />
          <span className="text-base font-semibold">AmMu Gambling</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
