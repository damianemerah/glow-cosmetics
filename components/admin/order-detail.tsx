"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index";
import { Loader2, Eye } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { formatZAR } from "@/utils";
import { mutate } from "swr";

interface OrderDetailProps {
  orderId: string;
  initialStatus: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_time: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderDetails {
  id: string;
  payment_reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  total_price: number;
  payment_method: string;
  created_at: string;
  cart_id: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
}

export function OrderDetail({ orderId, initialStatus }: OrderDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);
  const [status, setStatus] = useState(initialStatus);

  // Fetch order details when dialog opens
  const fetchOrderDetails = async () => {
    if (!isOpen || orderData) return;

    setIsLoading(true);
    try {
      // Fetch order data
      const { data: order, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) throw error;

      // Fetch order items
      const { data: items, error: itemsError } = await supabaseClient
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      setOrderData({
        ...order,
        items: items || [],
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.warning(
        `Failed to load order details\n${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabaseClient
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order status updated successfully");

      mutate("admin-orders");

      if (status) {
        mutate(`admin-orders-${status}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.warning(
        `Failed to update order status\n${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl" onOpenAutoFocus={fetchOrderDetails}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orderData ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Order {orderData.payment_reference}
              </DialogTitle>
              <DialogDescription>
                Placed on {new Date(orderData.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <div className="text-sm space-y-1">
                  <p>
                    {orderData.first_name} {orderData.last_name}
                  </p>
                  <p>{orderData.email}</p>
                  <p>{orderData.phone}</p>
                </div>

                <h3 className="font-semibold mt-4 mb-2">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  {orderData.shipping_address && (
                    <>
                      <p>{orderData.shipping_address.address}</p>
                      {orderData.shipping_address.apartment && (
                        <p>{orderData.shipping_address.apartment}</p>
                      )}
                      <p>
                        {orderData.shipping_address.city},{" "}
                        {orderData.shipping_address.state}{" "}
                        {orderData.shipping_address.zipCode}
                      </p>
                      <p>{orderData.shipping_address.country}</p>
                    </>
                  )}
                </div>

                <h3 className="font-semibold mt-4 mb-2">Payment</h3>
                <div className="text-sm space-y-1">
                  <p>
                    Method:{" "}
                    {orderData.payment_method?.replace("_", " ") ||
                      "Not specified"}
                  </p>
                  <p>
                    Status: {orderData.status?.replace("_", " ") || "Unknown"}
                  </p>
                  <p>Total: {formatZAR(orderData.total_price)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatZAR(item.price_at_time)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatZAR(item.price_at_time * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      {formatZAR(orderData.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center gap-2 pt-4">
              <div className="flex-1">
                <label className="text-sm mb-1 block">Update Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={updateOrderStatus}
                disabled={isUpdating || status === initialStatus}
                className="ml-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Failed to load order details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
