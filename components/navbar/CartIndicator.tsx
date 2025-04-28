"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useUserStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { getCartItemsCount } from "@/actions/cartAction";
import useSWR from "swr";

interface CartIndicatorProps {
  onClick: () => void;
  isOnline: boolean;
}

export const CartIndicator = ({ onClick, isOnline }: CartIndicatorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const user = useUserStore((state) => state.user);

  const offlineCartCount = useCartStore((state) => state.getOfflineCartCount());

  const { data: cartCount, mutate: mutateCartCount } = useSWR(
    user && isOnline ? `cart-count-${user.user_id}` : null,
    async () => {
      if (!user) return 0;
      try {
        const count = await getCartItemsCount(user.user_id!);
        return count;
      } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
      }
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      fallbackData: 0,
      dedupingInterval: 2000,
    }
  );

  useEffect(() => {
    mutateCartCount();
  }, [isOnline, user, mutateCartCount]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalCartCount =
    isMounted && isOnline && user
      ? (cartCount ?? 0)
      : isMounted
        ? offlineCartCount
        : 0;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="p-1 relative"
        aria-label={`Shopping cart with ${totalCartCount} items`}
      >
        <ShoppingBag className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
        {isMounted && totalCartCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-green-500 text-xs text-white font-semibold">
            {totalCartCount > 9 ? "9+" : totalCartCount}
          </span>
        )}
      </button>
    </div>
  );
};
