"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/index";
import useSWR from "swr";
import { useCartStore } from "@/store/cartStore";

interface EnhancedAddToCartProps {
  product: Product;
  className?: string;
  showQuantitySelector?: boolean;
  showBuyNow?: boolean;
}

export default function EnhancedAddToCart({
  product,
  className = "",
  showQuantitySelector = true,
  showBuyNow = true,
}: EnhancedAddToCartProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
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

  const handleQuantityChange = (amount: number) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.stock_quantity) {
        toast.info(`Only ${product.stock_quantity} items in stock.`);
        return product.stock_quantity;
      }
      return newQuantity;
    });
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // User is not logged in - show login modal or add to offline cart
    if (!user) {
      if (isOnline) {
        // Online but not logged in - show login modal
        useUserStore.getState().setShowModal(true);
        toast.info("Please log in to add items to your cart.");
        return;
      }
      return handleAddToOfflineCart();
    }

    // User is logged in but offline - add to offline cart
    if (!isOnline) {
      return handleAddToOfflineCart();
    }

    // User is logged in and online - use server action
    setIsAddingToCart(true);
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
          quantity
        );

        if (result.success) {
          toast.success(`${quantity} × ${product.name} added to cart`);
          // Trigger revalidation of cart count
          mutate();
        } else {
          toast.error(result.error || "Failed to add to cart");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      useUserStore.getState().setShowModal(true);
      toast.info("Please log in to proceed to checkout.");
      return;
    }

    setIsBuyingNow(true);
    try {
      const result = await addToCart(
        user.user_id!,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        quantity
      );

      if (result.success || result.error === "Item already in cart") {
        router.push("/checkout");
      } else {
        toast.error(result.error || "Failed to add item before checkout.");
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.error("Could not proceed to checkout.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToOfflineCart = () => {
    setIsAddingToCart(true);
    try {
      // Add to Zustand store instead of localStorage
      addOrUpdateOfflineItem(product.id, quantity);

      toast.success(`${quantity} × ${product.name} added to offline cart`);

      // Force component re-render to update UI if needed
      setIsAddingToCart(false);
    } catch (error) {
      console.error("Error adding to offline cart:", error);
      toast.error("Failed to add to offline cart");
      setIsAddingToCart(false);
    }
  };

  const canAddToCart = product.stock_quantity > 0;
  const canAdjustQuantity = product.stock_quantity > 0;
  const maxQuantityReached = quantity >= product.stock_quantity;

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {showQuantitySelector && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="inline-flex items-center overflow-hidden border rounded-md">
            {/* Decrement */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-none border-r-0 disabled:opacity-50"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || !canAdjustQuantity}
            >
              <Minus className="h-4 w-4" />
            </Button>

            {/* Quantity display */}
            <span className="flex h-10 w-12 items-center justify-center border-y px-3 text-center text-sm font-medium">
              {quantity}
            </span>

            {/* Increment */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-none border-l-0 disabled:opacity-50"
              onClick={() => handleQuantityChange(1)}
              disabled={maxQuantityReached || !canAdjustQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="flex-1 sm:flex-none bg-primary/90 hover:bg-primary text-primary-foreground"
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAddingToCart || isBuyingNow}
        >
          {isAddingToCart ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          Add to Cart
        </Button>

        {showBuyNow && (
          <Button
            variant="default"
            className="flex-1 sm:flex-none"
            onClick={handleBuyNow}
            disabled={!canAddToCart || isAddingToCart || isBuyingNow}
          >
            {isBuyingNow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );
}
