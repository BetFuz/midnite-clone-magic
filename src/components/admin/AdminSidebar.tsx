import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  TrendingUp,
  Database,
  Webhook,
  Settings,
  BarChart3,
  Shield,
  DollarSign,
  FileText,
  Bell,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Bets & Tickets", url: "/admin/bets", icon: Ticket },
      { title: "Finances", url: "/admin/finances", icon: DollarSign },
      { title: "Promotions", url: "/admin/promotions", icon: Zap },
    ],
  },
  {
    title: "Data & System",
    items: [
      { title: "Match Data", url: "/admin/data", icon: Database },
      { title: "Seed Data", url: "/admin/seed", icon: TrendingUp },
      { title: "Webhooks", url: "/admin/webhooks", icon: Webhook },
      { title: "Audit Logs", url: "/admin/audit", icon: FileText },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "AI Assets", url: "/admin/ai-assets", icon: Sparkles },
      { title: "Settings", url: "/admin/settings", icon: Settings },
      { title: "Security", url: "/admin/security", icon: Shield },
      { title: "Escrow", url: "/admin/escrow", icon: Shield },
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
    ],
  },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {menuItems.map((section) => {
          return (
            <SidebarGroup key={section.title}>
              {!collapsed && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className={collapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};
