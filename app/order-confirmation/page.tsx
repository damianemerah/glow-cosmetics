import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OrderConfirmationView, {
  type ConfirmationShippingAddress,
} from "@/components/checkout/order-confirmation-view";

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
  const shippingAddress =
    order.shipping_address as ConfirmationShippingAddress | null;

  // Store pickup info (from project rules)
  const storeInfo = {
    address: "4 westminister close, Bryanston",
    phone: "078 147 0504",
    hours: ["Monday to Friday: 9am - 6pm", "Saturday to Sunday: 8am - 6pm"],
  };

  return (
    <OrderConfirmationView
      order={order}
      shippingAddress={shippingAddress}
      storeInfo={storeInfo}
    />
  );
}
