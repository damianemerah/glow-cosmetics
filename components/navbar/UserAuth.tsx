"use client";

import Link from "next/link";
import { LogOut, Layers, Loader2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/constants/ui/index";
import { useUserStore } from "@/store/authStore";
import { LoginPopup } from "@/components/auth/LoginPopup";

interface UserAuthProps {
  onLogout: () => void;
  isLoading: boolean;
}

export const UserAuth = ({ onLogout, isLoading }: UserAuthProps) => {
  const user = useUserStore((state) => state.user);

  const getInitial = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  if (!user) {
    return <LoginPopup />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          disabled={isLoading}
        >
          <Avatar className="h-8 w-8">
            {isLoading ? (
              <AvatarFallback className="bg-gray-100">
                <Loader2 className="h-4 w-4 animate-spin" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={user?.avatar || ""} alt="User avatar" />
                <AvatarFallback className="bg-green-100 text-green-800">
                  {getInitial()}
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        {!isLoading && user && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none capitalize">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center cursor-pointer"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center cursor-pointer"
              >
                <Layers className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
