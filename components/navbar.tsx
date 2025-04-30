"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import useSWR from "swr";
import { AuthSessionMissingError, User } from "@supabase/supabase-js";

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
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] =
    useState(false);

  const user = useUserStore((state) => state.user);
  const isFetchingUser = useUserStore((state) => state.isFetchingUser);
  const setUser = useUserStore((state) => state.setUser);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const signOut = useUserStore((state) => state.signOut);

  const { mutate: mutateCartCount } = useSWR(
    initialAuthCheckComplete && user && !isFetchingUser && isOnline
      ? `cart-count-${user.id}`
      : null,
    null,
    { revalidateOnMount: false, revalidateOnFocus: true }
  );

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

  const attemptCartMerge = useCallback(
    async (userId: string) => {
      if (!isOnline || mergeAttemptedThisSessionRef.current) {
        return;
      }

      const offlineCart = useCartStore.getState().offlineItems;
      if (offlineCart.length > 0) {
        mergeAttemptedThisSessionRef.current = true;
        try {
          const result = await mergeOfflineCart(userId, offlineCart);
          if (result.success) {
            toast.success(
              `Synced cart: Added/updated ${result.itemsAdded || offlineCart.length} offline item(s).`
            );
            useCartStore.getState().clearOfflineCart();
            await mutateCartCount();
          } else {
            toast.warning(
              `Failed to sync offline cart: ${result.error || "Unknown reason"}. Items remain saved locally.`
            );
            mergeAttemptedThisSessionRef.current = false;
          }
        } catch (err) {
          const error = err as Error;
          toast.warning(
            `Failed to sync offline cart: ${error.message || "Unknown error"}. Items remain saved locally.`
          );
          console.error("Error merging offline cart:", error);
          mergeAttemptedThisSessionRef.current = false;
        }
      } else {
        mergeAttemptedThisSessionRef.current = true;
      }
    },
    [isOnline, mutateCartCount]
  );

  const processAuthUser = useCallback(
    async (authUser: User | null) => {
      if (authUser) {
        const profileFetched = await fetchUser(authUser.id);
        if (profileFetched) {
          mutateCartCount();
          await attemptCartMerge(authUser.id);
          if (searchParams.get("code")) {
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.delete("code");
            const newUrl = `${window.location.pathname}${newSearchParams.toString() ? "?" + newSearchParams.toString() : ""}`;
            router.replace(newUrl, { scroll: false });
          }
        } else {
          console.warn(
            "Profile fetch failed or user inactive for authUser:",
            authUser.id
          );
          setUser(null);
          mergeAttemptedThisSessionRef.current = false;
          mutateCartCount();
        }
      } else {
        setUser(null);
        mergeAttemptedThisSessionRef.current = false;
        mutateCartCount();
      }
      setInitialAuthCheckComplete(true);
    },
    [
      fetchUser,
      setUser,
      router,
      searchParams,
      mutateCartCount,
      attemptCartMerge,
    ]
  );

  useEffect(() => {
    let isMounted = true;
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          if (!(error instanceof AuthSessionMissingError)) {
            console.error("Error getting initial session:", error);
          }
          await processAuthUser(null);
        } else if (session) {
          await processAuthUser(session.user);
        } else {
          await processAuthUser(null);
        }
      } catch (error) {
        if (!isMounted) return;
        if (!(error instanceof AuthSessionMissingError)) {
          console.error(
            "Unexpected error during initial session check:",
            error
          );
        }
        await processAuthUser(null);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await processAuthUser(session?.user ?? null);
        if (event === "SIGNED_OUT") {
          mergeAttemptedThisSessionRef.current = false;
        }
      }
    );

    checkInitialSession();

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [processAuthUser]);

  const handleLogout = useCallback(async () => {
    await signOut();
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
      router.push("/");
    }
  }, [signOut, router, pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`${pathname === "/" && "sticky top-0 z-40"} w-full bg-white/80 backdrop-blur-sm shadow-sm`}
      >
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
          <BrandLogo />
          <div className="hidden lg:flex items-center space-x-6">
            <DesktopNavLinks navLinks={navLinks} />
            <div className="flex items-center space-x-4">
              <SearchCommand variant="desktop" />
              <SocialIcons />
              {!pathname.startsWith("/cart") &&
                !pathname.startsWith("/checkout") && (
                  <CartIndicator
                    onClick={() => setCartOpen(true)}
                    isOnline={isOnline}
                  />
                )}
            </div>
            <UserAuth
              onLogout={handleLogout}
              isLoading={isFetchingUser || !initialAuthCheckComplete}
            />
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/booking">Book Appointment</Link>
            </Button>
          </div>
          <div className="lg:hidden flex items-center space-x-2 sm:space-x-4">
            <SearchCommand variant="mobile" />
            <SocialIcons className="hidden sm:flex" />
            {!pathname.startsWith("/cart") &&
              !pathname.startsWith("/checkout") && (
                <CartIndicator
                  onClick={() => setCartOpen(true)}
                  isOnline={isOnline}
                />
              )}
            <MobileMenu
              navLinks={navLinks}
              onLogout={handleLogout}
              isLoading={isFetchingUser || !initialAuthCheckComplete}
            />
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
