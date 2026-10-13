"use client";

import { AlertCircle, ChevronRight, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Order, OrderItem } from "@/types/index";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/constants/ui/index";
import { formatZAR } from "@/utils";
import EmptyState from "./empty-state";
import StatusBadge from "./status-badge";

interface OrderHistoryProps {
  orders: Order[];
  initialError: boolean;
}

// The dashboard query joins each item's product; it isn't in the base type.
type OrderItemWithProduct = OrderItem & {
  product?: { image_url?: string[] | null } | null;
};

const itemImage = (item: OrderItem) =>
  (item as OrderItemWithProduct).product?.image_url?.[0] ?? null;

function ItemThumb({ item, size }: { item: OrderItem; size: number }) {
  const src = itemImage(item);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md border-2 border-card bg-secondary"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={item.product_name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <Package className="absolute inset-0 m-auto h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  );
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
    },
  );

  if (error || initialError) {
    return (
      <div className="flex items-center rounded-lg bg-destructive/5 p-4 text-destructive">
        <AlertCircle className="mr-2 h-5 w-5" />
        <p>Unable to load order data. Please try again.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="When you shop skincare or makeup with us, your orders and their status will show up here."
        action={{ label: "Shop the collection", href: "/products" }}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const itemCount =
          order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

        return (
          <button
            type="button"
            key={order.id}
            className="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="hidden -space-x-3 sm:flex">
              {order.items
                ?.slice(0, 3)
                .map((item) => (
                  <ItemThumb key={item.id} item={item} size={48} />
                ))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                Order #{order.payment_reference}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {order?.created_at &&
                  new Date(order.created_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                {" · "}
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
              <p className="font-semibold text-foreground">
                {formatZAR(order.total_price)}
              </p>
              <StatusBadge status={order.status} />
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        );
      })}

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-medium">
              Order details
            </DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Order #${selectedOrder.payment_reference}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <dl className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/50 p-4 text-sm">
                <div>
                  <dt className="eyebrow text-muted-foreground">Placed</dt>
                  <dd className="mt-1 text-foreground">
                    {selectedOrder.created_at &&
                      formatDate(selectedOrder.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={selectedOrder.status} />
                  </dd>
                </div>
              </dl>

              <div>
                <h4 className="eyebrow mb-3 text-muted-foreground">Items</h4>
                <ul className="max-h-[260px] divide-y overflow-y-auto">
                  {selectedOrder.items?.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0"
                    >
                      <ItemThumb item={item} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        {formatZAR(item.price_at_time * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground">Total</span>
                <span className="font-heading text-2xl text-foreground">
                  {formatZAR(selectedOrder.total_price)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
