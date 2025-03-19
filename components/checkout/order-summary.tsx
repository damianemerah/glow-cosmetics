"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";

interface OrderSummaryProps {
  cartItems: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }[];
}

export default function OrderSummary({ cartItems }: OrderSummaryProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const applyDiscount = () => {
    if (!discountCode.trim()) return;

    // Simulate discount application
    toast.success(
      `Discount code "${discountCode}" has been applied to your order.`
    );
    setDiscountApplied(true);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateDiscount = () => {
    return discountApplied ? calculateSubtotal() * 0.1 : 0; // 10% discount
  };

  const calculateShipping = () => {
    return 0; // Free shipping for now
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateShipping();
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 font-montserrat">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex py-2 border-b">
            <div className="h-16 w-16 bg-white rounded-md mr-4 flex-shrink-0 overflow-hidden relative">
              {item.image_url ? (
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.product_name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
              <div className="absolute -top-2 -right-2 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {item.quantity}
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">{item.product_name}</h4>
            </div>
            <div className="text-right">
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-grow"
          />
          <Button
            onClick={applyDiscount}
            variant="outline"
            disabled={!discountCode.trim() || discountApplied}
          >
            {discountApplied ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Applied
              </span>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        {discountApplied && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${calculateDiscount().toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {calculateShipping() === 0
              ? "Free"
              : `$${calculateShipping().toFixed(2)}`}
          </span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
