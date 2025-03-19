"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Users,
  ShoppingCart,
  BarChart2,
  MessageSquare,
  Settings,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Back to Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Messaging", href: "/admin/messaging", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <nav className="mt-6">
      <ul className="space-y-1 px-2">
        {navItems.map((item) => {
          const isActive =
            (pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))) &&
            item.href !== "/";
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
        <span className="sr-only">
          {isMobileMenuOpen ? "Close menu" : "Open menu"}
        </span>
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>
              Displays the mobile admin sidebar.
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-between p-4 border-b">
            <Link
              href="/admin"
              className="flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-xl font-bold text-primary font-montserrat">
                Glow Admin
              </span>
            </Link>
          </div>
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="w-[240px] min-h-screen bg-muted fixed left-0 top-0 z-30 hidden md:block">
        <div className="p-4">
          <Link href="/admin" className="flex items-center">
            <span className="text-xl font-bold text-primary font-montserrat">
              Glow Admin
            </span>
          </Link>
        </div>
        <NavContent />
      </aside>
    </>
  );
}
