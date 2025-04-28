"use client";
import { ShoppingBag } from "lucide-react";
import { Separator } from "@/constants/ui/index";
import Image from "next/image";
import { formatZAR } from "@/utils";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
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
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 font-montserrat">
        Order Summary
      </h2>
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-2 border-b last:border-b-0"
          >
            <div className="h-16 w-16 bg-white rounded-md mr-4 flex-shrink-0 relative border">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                  sizes="(max-width: 768px) 10vw, 5vw"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
              <div className="absolute -top-2 -right-2 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium text-gray-700">
                {item.quantity}
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium text-sm leading-tight">
                {item.product_name}
              </h4>
            </div>
            <div className="text-right ml-2">
              <span className="font-medium text-sm">
                {formatZAR(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
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

        <div className="flex justify-between font-bold text-lg pt-1">
          <span>Total</span>
          <span>{formatZAR(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
