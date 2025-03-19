"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Menu,
  ShoppingBag,
  LogOut,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/authStore";
import { LoginPopup } from "@/components/auth/LoginPopup";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CartPane } from "@/components/CartPane";
import { getCartItemCount } from "@/actions/cartAction";
import useSWR from "swr";

const supabase = createClient();

const Navbar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const signOut = useUserStore((state) => state.signOut);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch cart item count using SWR
  const { data: cartCount, mutate: mutateCartCount } = useSWR(
    user ? `cart-count-${user.user_id}` : null,
    async () => {
      if (!user) return 0;
      try {
        const count = await getCartItemCount(user.user_id!);
        return count;
      } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
      }
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      fallbackData: 0,
    }
  );

  useEffect(() => {
    const code = searchParams.get("code");

    const handleAuthChange = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      const { data, error: e2 } = await supabase.auth.getSession();

      console.log(data, e2, "🌐🌐🌐");

      console.log(user, "user");

      if (error) {
        return;
      }

      if (user) {
        fetchUser(user.id);
        mutateCartCount(); // Refresh cart count when user changes

        if (code) {
          const newSearchParams = new URLSearchParams(window.location.search);
          newSearchParams.delete("code");
          const newUrl = `${
            window.location.pathname
          }?${newSearchParams.toString()}`;
          router.replace(newUrl);
        }
      } else {
        setUser(null);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      handleAuthChange();
    });

    // Initial check
    handleAuthChange();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser, setUser, router, searchParams, mutateCartCount]);

  // Get initial letter of user's email for avatar fallback
  const getInitial = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    signOut();
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
      router.push("/");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Products", href: "/products" },
    { name: "Payment Plans", href: "/payment-plans" },
    { name: "Contact", href: "/contact" },
  ];

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`
        sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xs`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight font-montserrat">
              Glow by UgoSylvia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
              </Link>
              {/* Cart button with item count */}
              {pathname !== "/cart" && (
                <div className="relative">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="p-1 relative"
                    aria-label="Shopping cart"
                  >
                    <ShoppingBag className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </Badge>
                    )}
                  </button>
                </div>
              )}
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || ""}
                        alt={user.email || "User"}
                      />
                      <AvatarFallback className="bg-green-100 text-green-800">
                        {getInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginPopup />
            )}
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="/booking">Book Your Appointment</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-5 w-5 text-gray-700" />
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-5 w-5 text-gray-700" />
            </Link>
            {/* Mobile Cart button with item count */}
            {pathname !== "/cart" && (
              <div className="relative">
                <button onClick={() => setCartOpen(true)} className="p-1">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </Badge>
                  )}
                </button>
              </div>
            )}
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
                  <SheetDescription>
                    Displays the mobile sidebar.
                  </SheetDescription>
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
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.full_name || "User"}
                        </span>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  )}
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                    >
                      <Layers className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                  )}
                  <div onClick={() => setIsOpen(false)}>
                    {user ? (
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <LoginPopup />
                    )}
                  </div>
                  <Button
                    asChild
                    className="bg-green-500 hover:bg-green-600 mt-4"
                  >
                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                      Book Your Appointment
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CartPane open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default Navbar;
