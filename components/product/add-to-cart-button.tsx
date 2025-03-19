"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction";
import { toast } from "sonner";
import type { Product } from "@/types/dashboard";
import useSWR from "swr";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);

  // Access the SWR cache to mutate cart count
  const { mutate } = useSWR(user ? `cart-count-${user.user_id}` : null, null, {
    revalidateOnFocus: false,
  });

  const handleAddToCart = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    try {
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

  return (
    <Button
      className={`w-full sm:w-auto px-6 py-3 font-bold text-white cursor-pointer ${
        product.stock_quantity > 0
          ? "bg-green-500 hover:bg-green-600"
          : "bg-gray-400 cursor-not-allowed"
      } ${className || ""}`}
      disabled={product.stock_quantity <= 0 || isLoading}
      onClick={handleAddToCart}
    >
      {isLoading
        ? "Adding..."
        : product.stock_quantity > 0
        ? "Add to Cart"
        : "Out of Stock"}
    </Button>
  );
}
