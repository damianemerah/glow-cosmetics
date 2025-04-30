"use client";
import { ShoppingBag } from "lucide-react";
import { Separator } from "@/constants/ui/index";
import Image from "next/image";
import { formatZAR } from "@/utils";
import type { CheckoutCartItem } from "@/types"; // Use the detailed type

interface OrderSummaryProps {
  cartItems: CheckoutCartItem[];
  subtotal: number;
  deliveryMethodName: string;
  deliveryFee: number;
  totalAmount: number;
}

export default function OrderSummary({
  cartItems,
  subtotal,
  deliveryMethodName,
  deliveryFee,
  totalAmount,
}: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 sticky top-24">
      {" "}
      {/* Make summary sticky */}
      <h2 className="text-lg font-semibold mb-4 font-montserrat">
        Order Summary
      </h2>
      {/* Scrollable item list for many items */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {cartItems.map((item) => (
          <div
            key={item.id} // Use cart item ID as key
            className="flex items-center py-2 border-b last:border-b-0"
          >
            {/* Image and Quantity Badge */}
            <div className="relative h-16 w-16 flex-shrink-0 rounded-md border bg-white mr-4">
              {item.products?.image_url?.[0] ? ( // Safely access image
                <Image
                  src={item.products.image_url[0]}
                  alt={item.products.name}
                  fill // Use fill layout
                  sizes="64px" // Specify size
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
              {/* Quantity Badge */}
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shadow-md">
                {item.quantity}
              </div>
            </div>
            {/* Item Details */}
            <div className="flex-grow overflow-hidden">
              <h4 className="truncate font-medium text-sm leading-tight">
                {item.products?.name || "Product Name Missing"}{" "}
                {/* Product Name */}
              </h4>
              {/* Color Display */}
              {item.color && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Color: {item.color.name}
                </p>
              )}
            </div>
            {/* Price */}
            <div className="text-right ml-2 flex-shrink-0">
              <span className="font-medium text-sm">
                {/* Use price_at_time from item */}
                {formatZAR(item.price_at_time * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      {/* Totals Section */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatZAR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Delivery ({deliveryMethodName})
          </span>
          <span
            className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}
          >
            {deliveryFee === 0 ? "Free" : formatZAR(deliveryFee)}
          </span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-base md:text-lg pt-1">
          <span>Total</span>
          <span>{formatZAR(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
