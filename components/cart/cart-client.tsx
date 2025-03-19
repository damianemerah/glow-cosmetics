"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateCartItemQuantity,
  removeCartItem,
  getCartWithItems,
} from "@/actions/cartAction";
import { toast } from "sonner";
import Image from "next/image";
import { ShoppingBag, Loader2 } from "lucide-react";
import type { CartItem } from "@/types/dashboard";
import type { Cart } from "@/types/dashboard";

interface CartClientProps {
  initialCart: Cart | null;
  initialCartItems: CartItem[];
}

export default function CartClient({
  initialCart,
  initialCartItems,
}: CartClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart data
  const fetchCartData = async () => {
    if (!initialCart?.user_id) return;

    setIsLoading(true);
    try {
      const result = await getCartWithItems(initialCart.user_id);
      if (result.items) {
        setCart(result.cart);
        setCartItems(result.items as CartItem[]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity in the cart
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    setIsLoading(true);
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity);

      if (result.success) {
        // Update local state
        setCartItems(
          cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("An error occurred while updating the quantity");
      // Refresh data on error
      fetchCartData();
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item from the cart
  const removeItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const result = await removeCartItem(itemId);

      if (result.success) {
        // Update local state
        setCartItems(cartItems.filter((item) => item.id !== itemId));
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("An error occurred while removing the item");
      // Refresh data on error
      fetchCartData();
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + (item.price_at_time || item.product.price) * item.quantity,
    0
  );

  // Handle empty cart
  if (!cart || cartItems.length === 0) {
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
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm">
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

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 md:grid md:grid-cols-5 items-center"
              >
                <div className="col-span-2 flex items-center mb-4 md:mb-0">
                  <div className="h-20 w-20 bg-gray-100 rounded-md mr-4 flex-shrink-0 overflow-hidden relative">
                    {item.product?.image_url &&
                    item.product.image_url.length > 0 ? (
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
                    <h3 className="font-medium">{item.product.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
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
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                items):
              </span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between py-2 font-semibold">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button
                className="bg-green-600 hover:bg-green-700 w-full"
                size="lg"
                onClick={() => router.push("/checkout")}
                disabled={isLoading}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/products")}
                disabled={isLoading}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
