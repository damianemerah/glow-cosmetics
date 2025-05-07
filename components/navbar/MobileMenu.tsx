"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Layers, LogOut, CalendarCheck } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/constants/ui/index";
import { Heart } from "lucide-react";
import { useUserStore } from "@/store/authStore";
import { LoginPopup } from "@/components/auth/LoginPopup";
import { MobileNavLinks } from "./MobileNavLinks";

interface NavLink {
  name: string;
  href: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  onLogout: () => void;
  isLoading: boolean;
}

export const MobileMenu = ({
  navLinks,
  onLogout,
  isLoading,
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);

  const closeSheet = () => setIsOpen(false);

  const getInitial = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogoutClick = () => {
    // closeSheet();
    onLogout();
  };

  return (
    !isLoading && (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col space-y-6 py-6">
            {user && (
              <div className="flex items-center space-x-3 border-b pb-4 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || ""}
                    alt={user.email || "User"}
                  />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">
                    {user.full_name || "User"}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            )}
            <MobileNavLinks navLinks={navLinks} onLinkClick={closeSheet} />

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <Layers className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard#bookings"
                  className="flex items-center text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  My Bookings
                </Link>
                <Link
                  href="/dashboard#wishlist"
                  className="flex items-center text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </Link>
              </>
            )}

            {/* Auth Section */}
            <div className="pt-2 border-t">
              {user ? (
                <Button
                  onClick={handleLogoutClick}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <div className="w-full">
                  <LoginPopup />
                </div>
              )}
            </div>

            {/* Booking Button - Ensure it closes sheet */}
            <div className="mt-auto">
              <Button asChild className="bg-green-500 hover:bg-green-600">
                <Link href="/booking">Book Your Appointment</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  );
};
