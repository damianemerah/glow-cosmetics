"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/constants/ui/index";
import {
  updateCartItemQuantity,
  removeCartItem,
  getCartWithItems,
} from "@/actions/cartAction";
import { getProductsByIds } from "@/actions/productActions";
import { toast } from "sonner";
import Image from "next/image";
import { ShoppingBag, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { CartItem, Profile } from "@/types/index";
import type { Cart } from "@/types/index";
import { useUserStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import useSWR from "swr";
import { supabaseClient } from "@/lib/supabaseClient";

interface CartClientProps {
  initialCartItems: CartItem[];
  initialCart?: Cart | null;
}

interface DisplayCartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    slug: string;
  };
  color: string | null;
  quantity: number;
  price_at_time?: number;
}

const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE_NUMBER;

export default function CartClient({ initialCartItems }: CartClientProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user) as
    | (Profile & { id?: string })
    | null;
  const setShowModal = useUserStore((state) => state.setShowModal);
  const [isLoading, setIsLoading] = useState(false);

  // Get offline cart items from Zustand store
  const offlineItems = useCartStore((state) => state.offlineItems);
  const setOfflineItemQuantity = useCartStore(
    (state) => state.setOfflineItemQuantity
  );
  const removeOfflineItem = useCartStore((state) => state.removeOfflineItem);

  // Check if user is authenticated
  const isAuthenticated = Boolean(user && user.id);
  const userId = user?.id;

  // Get product IDs for offline cart to fetch product details
  const offlineProductIds = offlineItems.map((item) => item.id);

  // Fetch product details for offline cart items using SWR
  const { data: offlineProductsData, error: offlineProductsError } = useSWR(
    offlineProductIds.length > 0 && !isAuthenticated
      ? ["offlineProducts", ...offlineProductIds]
      : null,
    () => getProductsByIds(offlineProductIds)
  );

  // State for displayed cart items
  const [displayCartItems, setDisplayCartItems] = useState<DisplayCartItem[]>(
    []
  );

  // Fetch online cart data
  const {
    data: onlineCartData,
    error: onlineCartError,
    mutate: mutateOnlineCart,
  } = useSWR(isAuthenticated && userId ? `cart-${userId}` : null, () =>
    getCartWithItems(userId as string)
  );

  // Load data based on user status
  useEffect(() => {
    setIsLoading(true);

    if (isAuthenticated) {
      // User is authenticated - use online cart data
      if (onlineCartData?.items) {
        setDisplayCartItems(onlineCartData.items as DisplayCartItem[]);
      } else if (initialCartItems.length > 0) {
        // Use initial items if no SWR data yet
        setDisplayCartItems(initialCartItems as unknown as DisplayCartItem[]);
      }
    } else if (offlineProductsData?.products) {
      // User is not authenticated - create display items from offline cart and product data
      const cartItemsWithDetails = offlineItems
        .map((offlineItem) => {
          const product = offlineProductsData.products.find(
            (p) => p.id === offlineItem.id
          );
          if (!product) return null;

          return {
            id: offlineItem.id, // Using product ID as the item ID for offline cart
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url ? product.image_url[0] : null,
            },
            quantity: offlineItem.quantity,
          };
        })
        .filter(Boolean) as DisplayCartItem[];

      setDisplayCartItems(cartItemsWithDetails);
    }

    setIsLoading(false);
  }, [
    isAuthenticated,
    onlineCartData,
    offlineItems,
    offlineProductsData,
    initialCartItems,
  ]);

  // Update item quantity in the cart
  const updateQuantity = async (
    itemId: string,
    productId: string,
    newQuantity: number,
    color: string | null
  ) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    setIsLoading(true);
    try {
      // Check current product stock level first
      const { data: productData, error: productError } = await supabaseClient
        .from("products")
        .select("stock_quantity, name")
        .eq("id", productId)
        .single();

      if (productError) {
        throw new Error(
          `Failed to check product stock: ${productError.message}`
        );
      }

      if (!productData) {
        throw new Error(`Product not found`);
      }

      // Ensure new quantity doesn't exceed available stock
      if (newQuantity > productData.stock_quantity) {
        toast.warning(
          `Only ${productData.stock_quantity} units of ${productData.name} available`
        );
        return;
      }

      if (isAuthenticated) {
        // Online cart update
        const result = await updateCartItemQuantity(itemId, newQuantity);

        if (result.success) {
          // Mutate SWR cache to refresh data
          mutateOnlineCart();
          toast.success("Quantity updated");
        } else {
          toast.warning("Failed to update quantity");
        }
      } else {
        // Offline cart update using Zustand store
        setOfflineItemQuantity(productId, color, newQuantity);
        toast.success("Quantity updated");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.warning(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the quantity"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item from the cart
  const removeItem = async (
    itemId: string,
    productId: string,
    color: string | null
  ) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Online cart removal
        const result = await removeCartItem(itemId);

        if (result.success) {
          // Mutate SWR cache to refresh data
          mutateOnlineCart();
          toast.success("Item removed from cart");
        } else {
          toast.warning("Failed to remove item");
        }
      } else {
        // Offline cart removal using Zustand store
        removeOfflineItem(productId, color);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.warning("An error occurred while removing the item");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      // Trigger login popup
      setShowModal(true);
    }
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = () => {
    // Format message with product details
    const messageLines = [
      "Hello Glow by UgoSylvia, I'd like to inquire about ordering:",
    ];

    displayCartItems.forEach((item) => {
      messageLines.push(`- ${item.product.name} x ${item.quantity}`);
    });

    // Add estimated total
    const totalAmount = displayCartItems.reduce(
      (sum, item) =>
        sum + (item.price_at_time || item.product.price) * item.quantity,
      0
    );

    messageLines.push(
      `\nEstimated total: $${totalAmount.toFixed(2)} (subject to confirmation)`
    );

    // Construct and encode final message
    const messageString = messageLines.join("\n");
    const encodedMessage = encodeURIComponent(messageString);

    // Open WhatsApp URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Calculate total amount
  const totalAmount = displayCartItems.reduce(
    (sum, item) =>
      sum + (item.price_at_time || item.product.price) * item.quantity,
    0
  );

  // Handle loading errors
  if (
    (isAuthenticated && onlineCartError) ||
    (!isAuthenticated && offlineProductsError)
  ) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 mb-4">Error loading cart data</div>
        <Button
          className="bg-green-500 hover:bg-green-600"
          onClick={() => router.push("/products")}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  // Handle empty cart
  if (displayCartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Start adding items to your cart!</p>
        <Button
          className="bg-green-500 hover:bg-green-600"
          onClick={() => router.push("/products")}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="relative grid md:grid-cols-3 gap-8">
      {/* Loading Overlay - only shows the spinner without hiding the UI */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-xs">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          </div>
        </div>
      )}

      <div className="md:col-span-2">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <h2 className="font-semibold">Cart Items</h2>
          </div>

          <div className="divide-y">
            <div className="hidden md:grid md:grid-cols-5 text-sm text-gray-500 p-4">
              <div className="col-span-2">Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Total</div>
            </div>

            {displayCartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 md:grid md:grid-cols-5 items-center"
              >
                <div className="col-span-2 flex items-center mb-4 md:mb-0">
                  <div className="h-20 w-20 bg-gray-100 rounded-md mr-4 flex-shrink-0 overflow-hidden relative">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-medium block"
                    >
                      {item.product.name}
                    </Link>
                    {item.color && (
                      <p className="text-xs text-gray-500">
                        Color: {item.color}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        removeItem(item.id, item.product.id, item.color)
                      }
                      className="text-sm text-red-500 hover:text-red-700 mt-1"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="md:text-center text-sm mb-3 md:mb-0">
                  <span className="md:hidden inline-block w-24 font-medium">
                    Price:{" "}
                  </span>
                  ${(item.price_at_time || item.product.price).toFixed(2)}
                </div>

                <div className="flex items-center md:justify-center mb-3 md:mb-0">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.product.id,
                          item.quantity - 1,
                          item.color
                        )
                      }
                      disabled={isLoading || item.quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      readOnly
                      className="w-12 h-8 text-center border-0"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.product.id,
                          item.quantity + 1,
                          item.color
                        )
                      }
                      disabled={isLoading}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="md:text-right font-medium">
                  <span className="md:hidden inline-block w-24 font-medium">
                    Total:{" "}
                  </span>
                  $
                  {(
                    (item.price_at_time || item.product.price) * item.quantity
                  ).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="md:col-span-1">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <h2 className="font-semibold">Order Summary</h2>
          </div>
          <div className="p-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                Subtotal (
                {displayCartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                items):
              </span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <div className="border-t mt-4 pt-4 space-y-3">
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                size="lg"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please login to complete your purchase
                </p>
              )}

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={handleWhatsAppOrder}
                disabled={isLoading}
              >
                <FaWhatsapp className="h-5 w-5" />
                Order via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
