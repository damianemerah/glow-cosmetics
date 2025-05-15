"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction"; // Use the updated action
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Import necessary types including ColorInfo and CartItemInputData
import type { Product, ColorInfo, CartItemInputData } from "@/types/index";
import useSWR from "swr";
import { useCartStore } from "@/store/cartStore"; // Use your cart store

interface EnhancedAddToCartProps {
  product: Product;
  selectedColor: ColorInfo | null; // Add selectedColor prop
  className?: string;
  showQuantitySelector?: boolean;
  showBuyNow?: boolean;
}

export default function EnhancedAddToCart({
  product,
  selectedColor,
  className = "",
  showQuantitySelector = true,
  showBuyNow = true,
}: EnhancedAddToCartProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const user = useUserStore((state) => state.user);

  // Access Zustand store
  const addOrUpdateOfflineItem = useCartStore(
    (state) => state.addOrUpdateOfflineItem
  );
  const offlineItems = useCartStore((state) => state.offlineItems); // Correct state access

  // Access SWR cache
  const { mutate } = useSWR(user ? `cart-count-${user.user_id}` : null, null, {
    revalidateOnFocus: false,
  });

  const requiresColorSelection =
    Array.isArray(product.color) && product.color.length > 0;

  // Get available stock, considering offline cart items for the selected color
  const getAvailableStock = () => {
    const offlineQuantityForColor = offlineItems
      .filter(
        (item) =>
          item.id === product.id && item.color?.name === selectedColor?.name
      )
      .reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(0, product.stock_quantity - offlineQuantityForColor);
  };

  const availableStock = getAvailableStock();

  // Handle Quantity Change (no major changes needed, uses availableStock)
  const handleQuantityChange = (amount: number) => {
    // ... (quantity change logic using availableStock) ...
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + amount;
      if (newQuantity < 1) return 1;
      if (availableStock <= 0) {
        toast.info(`This item/color is out of stock.`);
        return prevQuantity; // Prevent increasing if no stock
      }
      if (newQuantity > availableStock) {
        toast.info(
          `Only ${availableStock} items available in stock${selectedColor ? ` for color ${selectedColor.name}` : ""}.`
        );
        return availableStock;
      }
      return newQuantity;
    });
  };

  // Validate color selection and stock
  const validateSelection = (): boolean => {
    if (requiresColorSelection && !selectedColor) {
      toast.warning("Select a color first.");
      return false;
    }
    // Re-check available stock at the moment of action
    const currentAvailableStock = getAvailableStock();
    if (quantity > currentAvailableStock) {
      toast.warning(
        `Only ${currentAvailableStock} items available in stock${selectedColor ? ` for color ${selectedColor.name}` : ""}. Please reduce quantity.`
      );
      // Optionally reset quantity to available stock
      setQuantity(currentAvailableStock > 0 ? currentAvailableStock : 1);
      return false;
    }
    if (currentAvailableStock <= 0 && quantity > 0) {
      toast.warning(`Item/color is out of stock.`);
      return false;
    }
    return true;
  };

  // Handle Add To Cart (Online & Offline)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateSelection()) return;

    if (!user) {
      return handleAddToOfflineCart(); // Offline, not logged in
    }

    // Online & Logged In - Use Server Action
    setIsAddingToCart(true);
    try {
      const itemData: CartItemInputData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || null,
        color: selectedColor,
      };

      const result = await addToCart(user.user_id!, itemData, quantity);

      if (result.success) {
        toast.success(`Added to cart`);
        mutate();
      } else {
        toast.warning(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.warning("An error occurred while adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Buy Now (Online only)
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateSelection()) return;

    if (!user) {
      useUserStore.getState().setShowModal(true);
      toast.info("Please log in to proceed to checkout.");
      return;
    }

    setIsBuyingNow(true);
    try {
      const itemData: CartItemInputData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || null,
        color: selectedColor,
      };
      const result = await addToCart(user.user_id!, itemData, quantity);

      if (result.success) {
        router.push("/checkout");
      } else {
        toast.warning(result.error || "Failed to add item before checkout.");
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.warning("Could not proceed to checkout.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Handle Add To Offline Cart
  const handleAddToOfflineCart = () => {
    if (!validateSelection()) return;

    setIsAddingToCart(true);
    try {
      // Prepare details needed by the offline store action
      const productDetails = {
        name: product.name,
        price: product.price,
        image_url: product.image_url || null,
        stock_quantity: product.stock_quantity,
      };

      // Call updated Zustand action
      addOrUpdateOfflineItem(
        product.id,
        quantity,
        selectedColor, // Pass the selected color object or null
        productDetails // Pass necessary details
      );

      toast.success(
        `${quantity} × ${product.name}${selectedColor ? ` (${selectedColor.name})` : ""} added to offline cart`
      );
      setIsAddingToCart(false);
    } catch (error) {
      console.error("Error adding to offline cart:", error);
      toast.warning("Failed to add to offline cart");
      setIsAddingToCart(false);
    }
  };

  // Determine button disabled state
  const isActionDisabled =
    availableStock <= 0 ||
    isAddingToCart ||
    isBuyingNow ||
    (requiresColorSelection && !selectedColor);

  const maxQuantityReached = quantity >= availableStock;

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="inline-flex items-center overflow-hidden border rounded-md">
            <Button
              variant="outline"
              size="icon"
              className="rounded-none border-r-0 disabled:opacity-50"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isActionDisabled} // Use combined disable flag
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span
              className="flex h-10 w-12 items-center justify-center border-y px-3 text-center text-sm font-medium"
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-none border-l-0 disabled:opacity-50"
              onClick={() => handleQuantityChange(1)}
              disabled={maxQuantityReached || isActionDisabled} // Use combined disable flag
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {availableStock <= 5 && availableStock > 0 && (
            <span className="text-xs text-orange-600">
              ({availableStock} left)
            </span>
          )}
          {availableStock <= 0 &&
            quantity > 0 && ( // Show OOS only if trying to select quantity > 0
              <span className="text-xs text-red-600">(Out of stock)</span>
            )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          className="flex-1 min-w-[150px] sm:flex-none bg-primary/90 hover:bg-primary text-primary-foreground"
          onClick={handleAddToCart}
          disabled={isActionDisabled}
          aria-label={
            !requiresColorSelection || selectedColor
              ? "Add to cart"
              : "Select a color to add to cart"
          }
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
            className="flex-1 min-w-[150px] sm:flex-none"
            onClick={handleBuyNow}
            disabled={isActionDisabled}
            aria-label={
              !requiresColorSelection || selectedColor
                ? "Buy now"
                : "Select a color to buy now"
            }
            title="Buy now"
          >
            {isBuyingNow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buy Now
          </Button>
        )}
      </div>
      {/* Validation Message */}
      {requiresColorSelection && !selectedColor && (
        <p className="text-sm text-red-600 pt-1">Select a color.</p>
      )}
      {availableStock <= 0 && (
        <p className="text-sm text-red-600 pt-1">
          This product/color is out of stock.
        </p>
      )}
    </div>
  );
}
