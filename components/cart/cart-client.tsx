"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/constants/ui/index";
import {
  updateCartItemQuantity,
  removeCartItem,
  getCartWithItems,
} from "@/actions/cartAction";
import { getProductsByIds } from "@/actions/productActions";
import { toast } from "sonner";
import Image from "next/image";
import {
  ShoppingBag,
  Loader2,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { CartItem, Profile } from "@/types/index";
import type { Cart } from "@/types/index";
import { useUserStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import useSWR from "swr";
import { supabaseClient } from "@/lib/supabaseClient";
import { formatZAR } from "@/utils";
import { keyValueData } from "@/constants/data";

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

const WHATSAPP_PHONE = keyValueData.whatsappNumber;

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
          toast.success("Removed from cart");
        } else {
          toast.warning("Failed to remove item");
        }
      } else {
        // Offline cart removal using Zustand store
        removeOfflineItem(productId, color);
        toast.success("Removed from cart");
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
      `\nEstimated total: ${formatZAR(totalAmount)} (subject to confirmation)`
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
      <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-14 text-center">
        <p className="mb-6 text-destructive">
          We couldn&apos;t load your cart. Please try again.
        </p>
        <Button onClick={() => router.push("/products")}>
          Browse products
        </Button>
      </div>
    );
  }

  // Handle empty cart
  if (displayCartItems.length === 0 && !isLoading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed bg-secondary/40 px-6 py-16 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h2 className="font-heading text-2xl font-medium text-foreground">
          Your bag is empty
        </h2>
        <p className="mb-8 mt-2 text-muted-foreground">
          Discover skincare and makeup picked by our experts.
        </p>
        <Button size="lg" onClick={() => router.push("/products")}>
          Start shopping
        </Button>
      </div>
    );
  }

  const itemCount = displayCartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="relative grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
      {/* Loading Overlay - only shows the spinner without hiding the UI */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
          <div className="rounded-full bg-card p-3 shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      )}

      <div className="lg:col-span-2">
        <div className="mb-2 hidden grid-cols-[1fr_auto_7rem] gap-6 border-b pb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:grid">
          <span>Product</span>
          <span className="w-28 text-center">Quantity</span>
          <span className="text-right">Total</span>
        </div>

        <ul className="divide-y">
          {displayCartItems.map((item) => {
            const unitPrice = item.price_at_time || item.product.price;
            return (
              <li
                key={item.id}
                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-6 md:grid-cols-[1fr_auto_7rem] md:items-center md:gap-6"
              >
                <div className="flex min-w-0 items-center gap-4 max-md:contents">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary md:h-28 md:w-24"
                  >
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-2 font-medium capitalize text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatZAR(unitPrice)}
                      {item.color && <> · {item.color}</>}
                    </p>
                    <button
                      onClick={() =>
                        removeItem(item.id, item.product.id, item.color)
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:contents">
                  <div className="inline-flex w-28 items-center justify-between rounded-full border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Decrease quantity"
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
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span
                      className="text-sm font-medium tabular-nums"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Increase quantity"
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
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <p className="text-right font-semibold text-foreground">
                    {formatZAR(unitPrice * item.quantity)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>

      <aside className="rounded-xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-heading text-2xl font-medium">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </dt>
            <dd className="font-medium">{formatZAR(totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-muted-foreground">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="mt-6 flex items-baseline justify-between border-t pt-6">
          <span className="font-medium">Estimated total</span>
          <span className="font-heading text-3xl text-foreground">
            {formatZAR(totalAmount)}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isAuthenticated ? "Proceed to checkout" : "Log in to checkout"}
          </Button>

          {!isAuthenticated && (
            <p className="text-center text-sm text-muted-foreground">
              Please log in to complete your purchase
            </p>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleWhatsAppOrder}
            disabled={isLoading}
          >
            <FaWhatsapp className="h-5 w-5" />
            Order via WhatsApp
          </Button>
        </div>
      </aside>
    </div>
  );
}
