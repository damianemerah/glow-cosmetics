import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Paystack from "paystack";

// Declare the module for TypeScript
declare module "paystack";

const paystackInstance = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const {
      email,
      orderId,
      amount,
      name,
      cartId,
      address,
      payment_method,
      reference
    } = await req.json();

    if (!email || !orderId || !amount || !name || !cartId || !payment_method || !reference) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (error || !order) {
      console.error("Error fetching order:", error);
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update order with payment method
    await supabase
      .from("orders")
      .update({
        payment_method: payment_method,
        status: payment_method === "bank_transfer" ? "awaiting_payment" : "pending_payment"
      })
      .eq("id", orderId);

    // Different handling based on payment method
    if (payment_method === "paystack") {
      // Initiate payment with Paystack
      const response = await paystackInstance.transaction.initialize({
        email,
        amount: Math.round(parseFloat(amount) * 100), // Convert to smallest currency unit
        reference,
        name,
        metadata: {
          order_id: orderId,
          cart_id: cartId,
          user_id: user.id,
          payment_method: payment_method,
          shipping_address: JSON.stringify(address),
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation?id=${orderId}`,
      });

      // Return the Paystack authorization URL
      return NextResponse.json({
        data: response.data
      }, { status: 200 });
    } else {
      // For bank transfer, just return success - no redirect needed
      return NextResponse.json({
        data: {
          reference: reference,
          message: "Bank transfer payment initiated",
        }
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your payment" },
      { status: 500 }
    );
  }
}
