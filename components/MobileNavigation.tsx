"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Heart, User, Filter, Search } from "lucide-react";
import { CategoryList } from "@/components/navbar/CategoryList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/constants/ui/index";
import { useScrollStore } from "@/store/scrollStore";
import { useUserStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Category } from "@/types";

interface MobileNavigationProps {
  productCategories: Category[];
}

export default function MobileNavigation({
  productCategories = [],
}: MobileNavigationProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isProductsRoute = pathname.startsWith("/products");

  const scrollToFiltersAction = useScrollStore(
    (state) => state.scrollToFilters
  );

  const setShowModal = useUserStore((state) => state.setShowModal);
  const user = useUserStore((state) => state.user);
  const { setIsSearchOpen } = useUiStore();

  if (!isMobile || pathname.startsWith("/admin")) return null;

  const handleFilterButtonClick = () => {
    if (isProductsRoute) {
      scrollToFiltersAction();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border border-gray-200 z-60">
      <div className="grid grid-cols-5 h-16 items-center">
        {isProductsRoute ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilterButtonClick}
            className="flex flex-col items-center justify-center rounded-none h-full text-xs text-gray-500  font-montserrat"
          >
            <Filter className="h-6 w-6 mb-1" />
            <span className="font-montserrat">Filter</span>
          </Button>
        ) : (
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center text-xs  font-montserrat`}
          >
            <Store className="h-6 w-6 mb-1" />
            <span className="font-montserrat">Store</span>
          </Link>
        )}

        <div className="flex items-center justify-center">
          <CategoryList
            buttonStyle="mobile-nav"
            initialCategories={productCategories}
          />
        </div>

        <div
          className={`flex flex-col items-center justify-center text-xs font-montserrat`}
          aria-label="Search"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-6 w-6 mb-1" />
          <span className="font-montserrat">Search</span>
        </div>

        <Link
          href="/dashboard#wishlists"
          className={`flex flex-col items-center justify-center text-xs font-montserrat ${pathname === "/dashboard#wishlists" ? "text-primary" : "text-gray-500"}`}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              setShowModal(true);
            }
          }}
        >
          <Heart className="h-6 w-6 mb-1" />
          <span className="font-montserrat">Wishlist</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center text-xs font-montserrat ${pathname === "/dashboard" ? "text-primary" : "text-gray-500"}`}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              setShowModal(true);
            }
          }}
        >
          <User className="h-6 w-6 mb-1" />
          <span className="font-montserrat">Account</span>
        </Link>
      </div>
    </div>
  );
}
