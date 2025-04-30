"use client";

import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Order } from "@/types/index";
import useSWR from "swr";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/constants/ui/index";

interface OrderHistoryProps {
  orders: Order[];
  initialError: boolean;
}

export default function OrderHistory({
  orders: initialOrders,
  initialError,
}: OrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => setSelectedOrder(order)}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div>
              <p className="font-medium">Order #{order.payment_reference}</p>
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
                    : order.status === "paid"
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

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Order #${selectedOrder.payment_reference}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Date</h4>
                  <p>
                    {selectedOrder.created_at &&
                      formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Status</h4>
                  <Badge
                    className={
                      selectedOrder.status === "completed"
                        ? "ml-3 bg-green-100 text-green-800"
                        : selectedOrder.status === "paid"
                          ? "ml-3 bg-blue-100 text-blue-800"
                          : selectedOrder.status === "shipped"
                            ? "ml-3 bg-purple-100 text-purple-800"
                            : "ml-3 bg-red-100 text-red-800"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${Number(item.price_at_time).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedOrder.total_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Track Order
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
