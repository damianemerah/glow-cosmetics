"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction";
import { toast } from "sonner";
import type { Product } from "@/types/dashboard";
import useSWR from "swr";
import { useCartStore } from "@/store/cartStore";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const user = useUserStore((state) => state.user);

  // Access the Zustand store for cart operations
  const addOrUpdateOfflineItem = useCartStore(
    (state) => state.addOrUpdateOfflineItem
  );

  // Access the SWR cache to mutate cart count
  const { mutate } = useSWR(user ? `cart-count-${user.user_id}` : null, null, {
    revalidateOnFocus: false,
  });

  // Track online status
  useEffect(() => {
    // Set initial online status
    setIsOnline(typeof navigator !== "undefined" && navigator.onLine);

    // Update online status when it changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // User is not logged in - show login modal or add to offline cart
    if (!user) {
      if (isOnline) {
        // Online but not logged in - show login modal
        return handleAddToOfflineCart();
      }
    }

    // User is logged in but offline - add to offline cart
    if (!isOnline) {
      return handleAddToOfflineCart();
    }

    // User is logged in and online - use server action
    setIsLoading(true);
    try {
      if (user) {
        const result = await addToCart(
          user.user_id!,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
          },
          1
        );

        if (result.success) {
          toast.success(`${product.name} added to cart`);
          // Trigger revalidation of cart count
          mutate();
        }
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToOfflineCart = () => {
    setIsLoading(true);
    try {
      // Add to Zustand store instead of localStorage
      addOrUpdateOfflineItem(product.id, 1);

      toast.success(`${product.name} added to offline cart`);

      // Force component re-render to update UI if needed
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding to offline cart:", error);
      toast.error("Failed to add to offline cart");
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={`w-full sm:w-auto px-6 py-3 font-bold text-white cursor-pointer ${
        product.stock_quantity > 0
          ? "bg-green-500 hover:bg-green-600"
          : "bg-gray-400 cursor-not-allowed"
      } ${className || ""}`}
      disabled={product.stock_quantity <= 0 || isLoading}
      onClick={(e) => handleAddToCart(e)}
    >
      {isLoading
        ? "Adding..."
        : !isOnline
          ? "Add to Offline Cart"
          : product.stock_quantity > 0
            ? "Add to Cart"
            : "Out of Stock"}
    </Button>
  );
}
