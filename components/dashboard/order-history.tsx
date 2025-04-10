"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import type { Order } from "@/types/dashboard";
import useSWR from "swr";

interface OrderHistoryProps {
  orders: Order[];
  initialError: boolean;
}

export default function OrderHistory({
  orders: initialOrders,
  initialError,
}: OrderHistoryProps) {
  // Use SWR with initial server-fetched data
  const { data: orders, error } = useSWR<Order[]>(
    "user-orders",
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialOrders,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  if (error || initialError) {
    return (
      <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Unable to load order data. Please try again.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No orders yet</p>
        <Button className="mt-4 bg-green-500 hover:bg-green-600" asChild>
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => {
            // This would typically navigate to an order detail page
            toast("Order Details", {
              description: `Viewing details for Order #${order.id.slice(0, 8)}`,
            });
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div>
              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">
                {order?.created_at &&
                  new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <p className="font-semibold text-green-600">
                ${order.total_price.toFixed(2)}
              </p>
              <Badge
                className={
                  order.status === "completed"
                    ? "ml-3 bg-green-100 text-green-800"
                    : order.status === "processing"
                      ? "ml-3 bg-blue-100 text-blue-800"
                      : order.status === "shipped"
                        ? "ml-3 bg-purple-100 text-purple-800"
                        : "ml-3 bg-red-100 text-red-800"
                }
              >
                {order.status}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
          </div>
        </div>
      ))}
    </div>
  );
}
