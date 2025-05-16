"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import useSWR from "swr";
import { AuthSessionMissingError, User } from "@supabase/supabase-js";

import { useUserStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

import { mergeOfflineCart } from "@/actions/cartAction";

import { CartPane } from "@/components/CartPane";

import { BrandLogo } from "./navbar/BrandLogo";
import { DesktopNavLinks } from "./navbar/DesktopNavLinks";
import { SearchCommand } from "./navbar/SearchCommand";
import { CartIndicator } from "./navbar/CartIndicator";
import { UserAuth } from "./navbar/UserAuth";
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
  const needsProfileCompletion = useUserStore(
    (state) => state.needsProfileCompletion
  );
  const signOut = useUserStore((state) => state.signOut);

  const { mutate: mutateCartCount } = useSWR(
    initialAuthCheckComplete && user && !isFetchingUser && isOnline
      ? `cart-count-${user.id}`
      : null,
    null,
    { revalidateOnMount: false, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (isFetchingUser) return;
    const needCompletion = needsProfileCompletion();
    if (needCompletion) {
      router.push("/complete-profile");
    }
  }, [needsProfileCompletion, isFetchingUser, router]);

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
              `Synced cart: Added/updated ${result.data?.itemsAdded || offlineCart.length} offline item(s).`
            );
            useCartStore.getState().clearOfflineCart();
            await mutateCartCount();
          } else {
            useCartStore.getState().clearOfflineCart();
            toast.warning(
              `Failed to sync some offline cart: ${result.error || "Unknown reason"}. Items removed locally.`
            );
            mergeAttemptedThisSessionRef.current = true;
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
      try {
        if (authUser?.id === user?.id) return;
        if (authUser) {
          const profileFetched = await fetchUser(authUser.id);

          if (!profileFetched) {
            setUser(null);
            return;
          }

          // Wait for both cart operations to complete
          await Promise.all([attemptCartMerge(authUser.id), mutateCartCount()]);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error processing auth user:", error);
      } finally {
        // Ensure this is always called last
        setInitialAuthCheckComplete(true);
      }
    },
    [fetchUser, setUser, mutateCartCount, attemptCartMerge, user?.id]
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
    const result = await signOut();
    if (result.success) {
      if (pathname.startsWith("/admin") || pathname === "/dashboard") {
        router.push("/");
        router.refresh();
      }
    } else {
      toast.error(`Logout failed: ${result.error || "Unknown error"}`);
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
          <DesktopNavLinks navLinks={navLinks} />
          <div className="hidden lg:flex items-center">
            <div className="flex items-center space-x-4 ml-8">
              <SearchCommand variant="desktop" />
              {!pathname.startsWith("/cart") &&
                !pathname.startsWith("/checkout") && (
                  <CartIndicator
                    onClick={() => setCartOpen(true)}
                    isOnline={isOnline}
                  />
                )}
            </div>
            <div className="ml-4">
              <UserAuth
                onLogout={handleLogout}
                isLoading={isFetchingUser || !initialAuthCheckComplete}
              />
            </div>
            <Button
              asChild
              size="sm"
              // Added ml-8 for significant separation before the primary CTA
              className="bg-primary hover:bg-primary/90 text-primary-foreground ml-8"
            >
              <Link href="/booking">Book Appointment</Link>
            </Button>
          </div>
          <div className="lg:hidden flex items-center space-x-2">
            <SearchCommand variant="desktop" />
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
