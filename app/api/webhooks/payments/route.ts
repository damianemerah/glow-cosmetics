import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { createHmac } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.error("Webhook Error: Missing x-paystack-signature header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify with Paystack secret
    const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Webhook Error: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    console.log("Received Paystack Event:", event.event);

    if (event.event === "charge.success") {
      const data = event.data;
      const metadata = data.metadata || {};
      const paymentType = metadata.type || "product-purchase";

      console.log(`Payment Type: ${paymentType}, Amount: ${data.amount / 100}`);

      if (paymentType === "deposit") {
        return await handleDepositPayment(data, metadata);
      } else {
        return await handleProductPurchase(data, metadata);
      }
    }

    // Acknowledge other event types without processing further
    return NextResponse.json({ received: true, event: event.event }, {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Provide more detail in the log if possible
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error Details:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function handleDepositPayment(data: any, metadata: any) {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const bookingId = metadata.booking_id || data.reference;

  if (!bookingId) {
    console.error(
      "Deposit Webhook Error: No booking ID found in metadata or reference:",
      metadata,
      data.reference,
    );
    return NextResponse.json(
      { error: "Missing booking identifier in metadata" },
      { status: 400 },
    );
  }

  console.log(`Processing deposit for booking group ID: ${bookingId}`);

  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      initial_deposit: data.amount / 100,
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (bookingError) {
    console.error(`Error updating booking group (${bookingId}):`, bookingError);
    return NextResponse.json(
      { error: "Error updating booking status after deposit" },
      { status: 500 },
    );
  }

  console.log(
    `Successfully updated booking group (${bookingId}) status to confirmed.`,
  );
  return NextResponse.json({
    success: true,
    message: "Booking deposit processed",
  }, { status: 200 });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function handleProductPurchase(data: any, metadata: any) {
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const orderId = metadata.order_id || data.reference;
  const paymentMethod = metadata.payment_method || "paystack";

  if (!orderId) {
    console.error(
      "Product Purchase Webhook Error: No order ID found in metadata or reference:",
      metadata,
      data.reference,
    );
    return NextResponse.json(
      { error: "Missing order ID in metadata" },
      { status: 400 },
    );
  }

  console.log(`Processing product purchase for order: ${orderId}`);

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
      payment_method: paymentMethod,
    })
    .eq("id", orderId);

  if (orderError) {
    console.error(`Error updating order status (${orderId}):`, orderError);
    return NextResponse.json(
      { error: "Error updating order status after payment" },
      { status: 500 },
    );
  }

  console.log(`Successfully updated order (${orderId}) status to paid.`);

  const { data: order, error: getOrderError } = await supabase
    .from("orders")
    .select("cart_id")
    .eq("id", orderId)
    .single();

  if (getOrderError || !order || !order.cart_id) {
    console.error(
      `Error fetching order details or cart_id for order (${orderId}):`,
      getOrderError,
      order,
    );
  } else {
    console.log(`Attempting to clear cart items for cart_id: ${order.cart_id}`);
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", order.cart_id);

    if (clearCartError) {
      console.error(
        `Error clearing cart items for cart_id (${order.cart_id}):`,
        clearCartError,
      );
    } else {
      console.log(
        `Successfully cleared cart items for cart_id: ${order.cart_id}`,
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: "Product purchase processed",
  }, { status: 200 });
}
