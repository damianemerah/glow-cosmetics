import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
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
      // Extract metadata
      const metadata = data.metadata || {};
      const paymentType = metadata.type || "product-purchase";

      if (paymentType === "deposit") {
        // Handle deposit payment for booking
        return await handleDepositPayment(data, metadata);
      } else {
        // Handle product purchase
        return await handleProductPurchase(data, metadata);
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

/* eslint-disable @typescript-eslint/no-explicit-any */
async function handleDepositPayment(data: any, metadata: any) {
  const bookingId = metadata.booking_id || data.reference;

  if (!bookingId) {
    console.error("No booking ID found in metadata:", metadata);
    return NextResponse.json(
      { error: "Missing booking ID in metadata" },
      { status: 400 }
    );
  }

  console.log(`Processing deposit for booking: ${bookingId}`);

  // Update booking with initial deposit and status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      initial_deposit: data.amount / 100, // Convert from kobo to naira
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (bookingError) {
    console.error("Error updating booking deposit:", bookingError);
    return NextResponse.json(
      { error: "Error updating booking" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

async function handleProductPurchase(data: any, metadata: any) {
  // Extract order ID from metadata
  const orderId = metadata.order_id || data.reference;
  const paymentMethod = metadata.payment_method || "paystack";

  if (!orderId) {
    console.error("No order ID found in metadata:", metadata);
    return NextResponse.json(
      { error: "Missing order ID in metadata" },
      { status: 400 }
    );
  }

  console.log(`Processing product purchase for order: ${orderId}`);

  // Update order status to paid
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
      payment_method: paymentMethod,
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
    console.error("Error fetching order:", getOrderError, order);
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
  // const { error: updateCartError } = await supabase
  //   .from("carts")
  //   .update({ status: "completed" })
  //   .eq("id", order.cart_id);

  // if (updateCartError) {
  //   console.error("Error updating cart status:", updateCartError);
  // }

  return NextResponse.json({ success: true }, { status: 200 });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
