"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Users,
  ShoppingCart,
  BarChart2,
  MessageSquare,
  Layers,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

// Define your navigation items
const navItems = [
  { name: "Back to Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Messaging", href: "/admin/messaging", icon: MessageSquare },
];

function NavContent() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="mt-6">
      {navItems.map((item) => {
        // Determine active state based on current path
        const isActive =
          (pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))) &&
          item.href !== "/";

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton isActive={isActive} tooltip={item.name} asChild>
              <Link href={item.href} className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export default function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="floating" className="hidden md:flex">
      {!isCollapsed && (
        <SidebarHeader className="mt-2">
          <div className="p-4 border-b">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold text-primary font-montserrat">
                Ugosylvia
              </span>
            </Link>
          </div>
        </SidebarHeader>
      )}
      <SidebarContent className={`${isCollapsed && "mt-8"}`}>
        <NavContent />
      </SidebarContent>
    </Sidebar>
  );
}
