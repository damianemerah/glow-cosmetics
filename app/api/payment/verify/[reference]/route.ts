import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Paystack from "paystack";

// Declare the module for TypeScript
declare module "paystack";

const paystackInstance = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function GET(
  req: Request,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const response = await paystackInstance.transaction.verify(reference);

    if (!response.status || response.data.status !== "success") {
      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
        data: response.data,
      });
    }

    // Extract order ID from reference (e.g., order_123456)
    const orderId = reference.startsWith("order_")
      ? reference.substring(6)
      : reference;

    const supabase = await createClient();

    // Update order status to paid if not already
    const { data: order, error: getOrderError } = await supabase
      .from("orders")
      .select("status, cart_id")
      .eq("id", orderId)
      .single();

    if (getOrderError) {
      console.error("Error fetching order:", getOrderError);
      return NextResponse.json(
        { error: "Error fetching order details" },
        { status: 500 }
      );
    }

    // Only update if not already paid
    if (order && order.status !== "paid") {
      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order status:", updateError);
        return NextResponse.json(
          { error: "Error updating order" },
          { status: 500 }
        );
      }

      // Clear the cart items
      await supabase.from("cart_items").delete().eq("cart_id", order.cart_id);

      // Mark the cart as completed
      await supabase
        .from("carts")
        .update({ status: "completed" })
        .eq("id", order.cart_id);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId,
        status: "paid",
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}
