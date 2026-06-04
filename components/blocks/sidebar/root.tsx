'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { AccountFooter } from './account-footer';
import { LogoHeader } from './logo-header';
import { NavGames } from './nav-games';

export default function SidebarRoot() {
  const { setOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <LogoHeader />
      </SidebarHeader>
      <SidebarContent onClick={() => setOpen(true)}>
        <NavGames />
      </SidebarContent>
      <SidebarFooter>
        <AccountFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
