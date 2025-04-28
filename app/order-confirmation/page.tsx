import { createClient } from "@/utils/supabase/server";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/constants/ui/index";

import { CheckCircle, Package, CreditCard, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Confirmation | Glow Cosmetics",
  description: "Thank you for your order with Glow Cosmetics",
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const supabase = await createClient();

  // Get the order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (*)
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  // If the user isn't authenticated properly for this order, redirect to login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== order.user_id) {
    redirect("/?redirect=/order-confirmation?id=" + orderId);
  }

  // Format the shipping address for display
  const shippingAddress = order.shipping_address as {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold font-montserrat">
            Order Confirmed!
          </CardTitle>
          <CardDescription>
            Order Reference: {order.payment_reference}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 p-2 rounded bg-gray-50 text-sm">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Status:</span>
              <span
                className={`font-medium ${
                  order.status === "paid" ? "text-green-600" : "text-orange-500"
                }`}
              >
                {order.status === "paid" ? "Paid" : "Pending Payment"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-medium">
                ${order.total_price?.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="mb-4">
            Thank you for your purchase. We&apos;ve sent a confirmation email to{" "}
            {order.email}.
          </p>

          {shippingAddress && (
            <Collapsible className="bg-gray-50 p-4 rounded-md mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full font-medium">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Shipping Information
                </div>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="text-sm text-muted-foreground text-left mt-2">
                <p>
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p>{shippingAddress.address}</p>
                {shippingAddress.apartment && (
                  <p>{shippingAddress.apartment}</p>
                )}
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.country}</p>
                <p className="mt-2">
                  Your order will be shipped within 1-2 business days.
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}

          {order.status !== "paid" && (
            <div className="mt-4 mb-4 p-3 border border-orange-200 rounded-md bg-orange-50">
              <h3 className="font-medium mb-2 flex items-center text-orange-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Pending
              </h3>
              <p className="text-sm text-orange-700">
                We&apos;re still processing your payment. Please contact support
                if you&apos;ve already paid.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">View My Orders</Link>
          </Button>
          <Button asChild className="bg-green-500 hover:bg-green-600">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
