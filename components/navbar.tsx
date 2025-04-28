"use client";
//Copilot: remove all comments

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import useSWR from "swr";

import { useUserStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

import { mergeOfflineCart } from "@/actions/cartAction";

import { CartPane } from "@/components/CartPane";

import { BrandLogo } from "./navbar/BrandLogo";
import { UserAuth } from "./navbar/UserAuth";
import { DesktopNavLinks } from "./navbar/DesktopNavLinks";
import { SocialIcons } from "./navbar/SocialIcons";
import { SearchCommand } from "./navbar/SearchCommand";
import { CartIndicator } from "./navbar/CartIndicator";
import { MobileMenu } from "./navbar/MobileMenu";
import Link from "next/link";
import { Button } from "@/constants/ui/index";

const supabase = createClient();

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Products", href: "/products" },
  { name: "Contact", href: "/contact" },
];

const Navbar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOnline, setIsOnline] = useState(true);
  const mergeAttemptedThisSessionRef = useRef(false);
  const [cartOpen, setCartOpen] = useState(false);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const signOut = useUserStore((state) => state.signOut);

  const { mutate: mutateCartCount } = useSWR(
    user && isOnline ? `cart-count-${user.user_id}` : null,
    { revalidateOnMount: false, revalidateOnFocus: false }
  );

  // Track online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleAuthChange = useCallback(async () => {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();
    if (error) return;

    if (authUser) {
      await fetchUser(authUser.id);
      mutateCartCount();

      const code = searchParams.get("code");
      if (code) {
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.delete("code");
        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
        router.replace(newUrl);
      }
    } else {
      setUser(null);
      mergeAttemptedThisSessionRef.current = false;
      mutateCartCount();
    }
  }, [fetchUser, setUser, router, searchParams, mutateCartCount]);

  const attemptCartMerge = useCallback(
    async (userId: string) => {
      if (!isOnline || mergeAttemptedThisSessionRef.current) return;

      const offlineCart = useCartStore.getState().offlineItems;
      if (offlineCart.length > 0) {
        mergeAttemptedThisSessionRef.current = true;
        console.log("Attempting to merge offline cart:", offlineCart);

        try {
          const result = await mergeOfflineCart(userId, offlineCart);
          toast.success(
            `Synced cart: Added ${result.itemsAdded} offline item(s)`
          );
          useCartStore.getState().clearOfflineCart();
          mutateCartCount(); // Refresh cart count after successful merge
        } catch (err) {
          console.error("Error merging offline cart:", err);
          toast.error(
            "Failed to sync your offline cart. Items remain saved locally."
          );
        }
      }
    },
    [isOnline, mutateCartCount]
  );

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`);
        await handleAuthChange();

        if (event === "SIGNED_IN" && session?.user) {
          await attemptCartMerge(session.user.id);
        } else if (event === "SIGNED_OUT") {
          mergeAttemptedThisSessionRef.current = false;
        }
      }
    );

    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await handleAuthChange();
      if (session?.user) {
        await attemptCartMerge(session.user.id);
      }
    };

    checkInitialSession();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [handleAuthChange, attemptCartMerge]);

  const handleLogout = useCallback(async () => {
    await signOut();
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
      router.push("/");
    }
    mergeAttemptedThisSessionRef.current = false;
    mutateCartCount();
  }, [signOut, router, pathname, mutateCartCount]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <BrandLogo />

          <div className="hidden lg:flex items-center space-x-6">
            <DesktopNavLinks navLinks={navLinks} />
            <div className="flex items-center space-x-4">
              <SearchCommand variant="desktop" />
              <SocialIcons />
              {pathname !== "/cart" && (
                <CartIndicator
                  onClick={() => setCartOpen(true)}
                  isOnline={isOnline}
                />
              )}
            </div>
            <UserAuth onLogout={handleLogout} />
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="/booking">Book Your Appointment</Link>
            </Button>
          </div>

          <div className="lg:hidden flex items-center space-x-2 sm:space-x-4">
            <SearchCommand variant="mobile" />
            <SocialIcons className="hidden sm:flex" />{" "}
            {pathname !== "/cart" && (
              <CartIndicator
                onClick={() => setCartOpen(true)}
                isOnline={isOnline}
              />
            )}
            <MobileMenu navLinks={navLinks} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <CartPane
        open={cartOpen}
        onOpenChange={setCartOpen}
        isOnline={isOnline}
      />
    </>
  );
};

export default Navbar;
