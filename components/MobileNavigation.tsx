"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Heart, User, Filter } from "lucide-react";
import { CategoryList } from "@/components/navbar/CategoryList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/constants/ui/index";
import { SearchCommand } from "@/components/navbar/SearchCommand";
import { useScrollStore } from "@/store/scrollStore";
import { useUserStore } from "@/store/authStore";

export default function MobileNavigation() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isProductsRoute = pathname.startsWith("/products");

  const scrollToFiltersAction = useScrollStore(
    (state) => state.scrollToFilters
  );

  const setShowModal = useUserStore((state) => state.setShowModal);
  const user = useUserStore((state) => state.user);

  // Don't render on desktop or admin pages
  if (!isMobile || pathname.startsWith("/admin")) return null;

  const handleFilterButtonClick = () => {
    if (isProductsRoute) {
      scrollToFiltersAction(); // Call the action from the store
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border border-gray-200 z-60">
      <div className="grid grid-cols-5 h-16">
        <Link
          href={`${isProductsRoute ? "/" : "/products"}`}
          className={`flex flex-col items-center justify-center text-xs`}
        >
          {isProductsRoute ? (
            <Home className="h-5 w-5 mb-1" />
          ) : (
            <Store className="h-5 w-5 mb-1" />
          )}
          <span>{isProductsRoute ? "Home" : "Store"}</span>
        </Link>

        {isProductsRoute ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilterButtonClick}
            className="flex flex-col items-center justify-center rounded-none h-full text-xs text-gray-500"
          >
            <Filter className="h-5 w-5 mb-1" />
            <span>Filter</span>
          </Button>
        ) : (
          <div className="flex items-center justify-center">
            <CategoryList buttonStyle="mobile-nav" />
          </div>
        )}

        <SearchCommand variant="mobile" />

        <Link
          href="/dashboard#wishlist"
          className={`flex flex-col items-center justify-center text-xs ${
            pathname === "/dashboard#wishlist"
              ? "text-primary"
              : "text-gray-500"
          }`}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              setShowModal(true);
            }
          }}
        >
          <Heart className="h-5 w-5 mb-1" />
          <span>Wishlist</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center text-xs ${
            pathname === "/dashboard" ? "text-primary" : "text-gray-500"
          }`}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              setShowModal(true);
            }
          }}
        >
          <User className="h-5 w-5 mb-1" />
          <span>Account</span>
        </Link>
      </div>
    </div>
  );
}
