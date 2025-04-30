"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, WifiOff } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/constants/ui/index";
import Image from "next/image";
import { useUserStore } from "@/store/authStore";
import { getCartWithItems, removeCartItem } from "@/actions/cartAction";
import { getProductsByIds } from "@/actions/productActions";
import { toast } from "sonner";
import type { CartItem } from "@/types/index";
import { Database } from "@/types/types";
import CartPaneSkeleton from "@/components/cart/cart-pane-skeleton";
import useSWR, { mutate } from "swr";
import { formatZAR } from "@/utils";
import { useCartStore } from "@/store/cartStore";

interface CartPaneProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOnline?: boolean;
}

// Define the shape of the raw cart item from the API join result
type BaseCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type BaseProduct = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "price" | "image_url"
>;

interface RawCartItem extends BaseCartItem {
  product: BaseProduct | null;
}

export function CartPane({
  open,
  onOpenChange,
  isOnline = true,
}: CartPaneProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);
  const [offlineCartItems, setOfflineCartItems] = useState<CartItem[]>([]);
  const [loadingOfflineItems, setLoadingOfflineItems] = useState(false);

  // Use the Zustand store for offline cart
  const offlineItems = useCartStore((state) => state.offlineItems);
  const removeOfflineItem = useCartStore((state) => state.removeOfflineItem);

  // Get online cart data using SWR
  const {
    data: cartWithItems,
    isLoading: isLoadingOnlineCart,
    error: onlineCartError,
    mutate: mutateOnlineCart,
  } = useSWR(open && user && isOnline ? `cart-${user.user_id}` : null, () => {
    if (!user || !user.user_id) return null;
    return getCartWithItems(user.user_id);
  });

  // Load offline cart items and their product details when component opens
  useEffect(() => {
    const loadOfflineCart = async () => {
      if (!open) return;

      setLoadingOfflineItems(true);
      try {
        // Get offline cart from Zustand store
        // Make sure offlineItems is an array and not empty
        if (!offlineItems || offlineItems.length === 0) {
          setOfflineCartItems([]);
          setLoadingOfflineItems(false);
          return;
        }

        // Extract product IDs from array
        const productIds = [...offlineItems].map((item) => item.id);

        // Fetch product details
        const { products } = await getProductsByIds(productIds);

        // Combine product details with cart quantities
        const items: CartItem[] = products
          .map((product) => {
            const cartItem = offlineItems.find(
              (item) => item.id === product.id
            );
            return {
              id: product.id, // Using product ID as cart item ID for offline cart
              cart_id: "offline-cart",
              product_id: product.id,
              quantity: cartItem?.quantity || 0,
              price_at_time: product.price,
              color: cartItem?.color?.name || null, // Update color property to match type
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || [],
              },
              subtotal: product.price * (cartItem?.quantity || 0),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          })
          .filter((item) => item.quantity > 0);

        setOfflineCartItems(items);
      } catch (error) {
        console.error("Error loading offline cart:", error);
        toast.warning("Failed to load offline cart items");
      } finally {
        setLoadingOfflineItems(false);
      }
    };

    loadOfflineCart();
  }, [open, isOnline, offlineItems]);

  // Format online cart items
  const onlineCartItems: CartItem[] = !cartWithItems?.items
    ? []
    : (cartWithItems.items as RawCartItem[]).map((item) => ({
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity || 0,
        price_at_time: item.price_at_time || 0,
        color: item.color || null,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image_url: item.product.image_url || [],
            }
          : {
              id: item.product_id || "",
              name: "Unknown Product",
              price: item.price_at_time || 0,
              image_url: [],
            },
        subtotal: (item.quantity || 0) * (item.price_at_time || 0),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }));

  // Determine which cart items to display based on online status and user
  const cartItems = isOnline && user ? onlineCartItems : offlineCartItems;
  const isLoading =
    isOnline && user ? isLoadingOnlineCart : loadingOfflineItems;
  const error = isOnline && user ? onlineCartError : false;

  const handleViewCart = () => {
    router.push("/cart");
    onOpenChange(false);
  };

  const handleRemoveItem = async (itemId: string, color: string) => {
    if (isOnline && user) {
      try {
        const result = await removeCartItem(itemId);

        if (result.success) {
          // Update local state via SWR
          mutateOnlineCart();
          mutate(`cart-count-${user.user_id}`);
          toast.success("Item removed from cart");
        } else {
          toast.warning("Failed to remove item");
        }
      } catch (err) {
        console.error("Error removing item:", err);
        toast.warning("An error occurred while removing the item");
      }
    } else {
      // Handle removal from offline cart using Zustand store
      try {
        removeOfflineItem(itemId, color);
        toast.success("Item removed from cart");
      } catch (err) {
        console.error("Error removing offline item:", err);
        toast.warning("Failed to remove item from cart");
      }
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.price_at_time || item.product?.price) * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!user && isOnline) {
      setShowModal(true);
      onOpenChange(false);
      return;
    }

    router.push("/checkout");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-4 sm:p-6" side="right">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold font-montserrat flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Cart
            {!isOnline && (
              <div className="ml-auto flex items-center text-amber-500 text-sm">
                <WifiOff className="h-4 w-4 mr-1" />
                Offline Mode
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <CartPaneSkeleton />
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            <p>Failed to load cart items</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => (user && isOnline ? mutateOnlineCart() : null)}
            >
              Try Again
            </Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button
              className="mt-4 bg-green-500 hover:bg-green-600"
              onClick={() => {
                router.push("/products");
                onOpenChange(false);
              }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-grow overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b group"
                >
                  <div className="flex items-center space-x-4">
                    {item.product?.image_url &&
                    Array.isArray(item.product.image_url) &&
                    item.product.image_url.length > 0 ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image
                          src={item.product.image_url[0]}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h4 className="font-medium capitalize">
                        {item.product?.name || "Unknown Product"}
                      </h4>
                      <div className="flex items-center justify-between mt-1 space-x-4">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          {formatZAR(
                            item.price_at_time || item.product?.price || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.color || "")}
                    className="text-muted-foreground hover:text-red-500 opacity-50 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-auto border-t">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">
                  {formatZAR(calculateSubtotal())}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Shipping and taxes calculated at checkout
              </p>
              <Button
                className="w-full bg-green-500 hover:bg-green-600 mb-2"
                onClick={handleViewCart}
              >
                View Cart
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
              {!isOnline && (
                <div className="mt-3 text-center text-xs text-amber-600">
                  <p>
                    You&apos;re currently offline. Your cart is saved locally.
                  </p>
                  <p>Connect to the internet to complete your purchase.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </SheetContent>
    </Sheet>
  );
}
