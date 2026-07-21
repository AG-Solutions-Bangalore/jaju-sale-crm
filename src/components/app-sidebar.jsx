import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  FileText,
  Box,
  Mountain,
  ShoppingCart,
  Warehouse,
  Package,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainUser } from "./nav-main-user";
import Cookies from "js-cookie";

export function AppSidebar({ ...props }) {
  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");

  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `Jaju Flooring`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "DASHBOARD",
        url: "/sale-dashboard",
        icon: LayoutDashboard,
        isActive: false,
      },
      {
        title: "ESTIMATE",
        url: "/estimate",
        icon: FileText,
        isActive: false,
      },
      // {
      //   title: "OLD ESTIMATE",
      //   url: "/oldestimate",
      //   icon: FileText,
      //   isActive: false,
      // },
      // {
      //   title: "PRODUCT",
      //   url: "/product",
      //   icon: Box,
      //   isActive: false,
      // },
      {
        title: "PURCHASE",
        url: "/purchase",
        icon: Mountain,
        isActive: false,
      },
      {
        title: "SALE",
        url: "/sales",
        icon: ShoppingCart,
        isActive: false,
      },
      {
        title: "REPORTS",
        icon: Warehouse,
        isActive: false,
        items: [
          {
            title: "Stock",
            url: "/stocks",
            icon: Box,
          },
          {
            title: "Single Item Stock",
            url: "/single-item-stock",
            icon: Package,
          },
          {
            title: "Sales Report",
            url: "/sales-report",
            icon: FileText,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={initialData.navMain} />
        <NavMainUser projects={initialData.userManagement} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

//changes
