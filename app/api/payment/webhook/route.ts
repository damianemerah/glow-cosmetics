import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createHmac } from "crypto";
// import Paystack from "paystack";

// Declare the module for TypeScript
declare module "paystack";

// const paystackInstance = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify with Paystack secret
    const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle successful payment
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;

      // Extract order ID from reference (e.g., order_123456)
      const orderId = reference.startsWith("order_")
        ? reference.substring(6)
        : reference;

      const supabase = await createClient();

      // Update order status to paid
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (orderError) {
        console.error("Error updating order status:", orderError);
        return NextResponse.json(
          { error: "Error updating order" },
          { status: 500 }
        );
      }

      // Get cart ID from order
      const { data: order, error: getOrderError } = await supabase
        .from("orders")
        .select("cart_id")
        .eq("id", orderId)
        .single();

      if (getOrderError || !order) {
        console.error("Error fetching order:", getOrderError);
        return NextResponse.json(
          { error: "Error fetching order details" },
          { status: 500 }
        );
      }

      // Clear the cart items
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", order.cart_id);

      if (clearCartError) {
        console.error("Error clearing cart:", clearCartError);
      }

      // Mark the cart as completed
      const { error: updateCartError } = await supabase
        .from("carts")
        .update({ status: "completed" })
        .eq("id", order.cart_id);

      if (updateCartError) {
        console.error("Error updating cart status:", updateCartError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
