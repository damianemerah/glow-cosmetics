"use client";

import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUserStore } from "@/store/authStore";
import { getCartWithItems, removeCartItem } from "@/actions/cartAction";
import { toast } from "sonner";
import type { CartItem } from "@/types/dashboard";
import { Database } from "@/types/types";
import CartPaneSkeleton from "@/components/cart/cart-pane-skeleton";
import useSWR from "swr";

interface CartPaneProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CartPane({ open, onOpenChange }: CartPaneProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);

  const {
    data: cartWithItems,
    isLoading,
    error,
    mutate,
  } = useSWR(open && user ? `cart-${user.user_id}` : null, () => {
    if (!user || !user.user_id) return null;
    return getCartWithItems(user.user_id);
  });

  // Format cart items
  const cartItems: CartItem[] = !cartWithItems?.items
    ? []
    : (cartWithItems.items as RawCartItem[]).map((item) => ({
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity || 0,
        price_at_time: item.price_at_time || 0,
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
      }));

  const handleViewCart = () => {
    router.push("/cart");
    onOpenChange(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await removeCartItem(itemId);

      if (result.success) {
        // Update local state via SWR
        mutate();
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("An error occurred while removing the item");
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
    if (!user) {
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
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <CartPaneSkeleton />
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            <p>Failed to load cart items</p>
            <Button variant="outline" className="mt-4" onClick={() => mutate()}>
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
                      <h4 className="font-medium">
                        {item.product?.name || "Unknown Product"}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          $
                          {(
                            item.price_at_time ||
                            item.product?.price ||
                            0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
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
                  ${calculateSubtotal().toFixed(2)}
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
