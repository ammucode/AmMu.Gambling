import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AccountFooter } from './account-footer';

export default function SidebarRoot() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>{/* <TeamSwitcher teams={data.teams} /> */}</SidebarHeader>
      <SidebarContent>hi</SidebarContent>
      <SidebarFooter>
        <AccountFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
