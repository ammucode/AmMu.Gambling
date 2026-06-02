import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavUser } from "./user-footer";

export default function AppSidebar() {
  return <Sidebar collapsible="icon"  >
    <SidebarHeader>
      {/* <TeamSwitcher teams={data.teams} /> */}
    </SidebarHeader>
    <SidebarContent>
      hi
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
}