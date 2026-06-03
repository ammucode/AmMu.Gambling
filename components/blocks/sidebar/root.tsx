import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AccountFooter } from './account-footer';
import { LogoHeader } from './logo-header';
import { NavGames } from './nav-games';

export default function SidebarRoot() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <LogoHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavGames />
      </SidebarContent>
      <SidebarFooter>
        <AccountFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
