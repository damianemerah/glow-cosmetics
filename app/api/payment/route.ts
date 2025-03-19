import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Paystack from "paystack";

// Declare the module for TypeScript
declare module "paystack";

const paystackInstance = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { email, orderId, amount, name, cartId, address } = await req.json();

    if (!email || !orderId || !amount || !name || !cartId) {
      return NextResponse.json(
        { error: "Email, order ID, amount, name, and cart ID are required" },
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

    // Initiate payment with Paystack
    const response = await paystackInstance.transaction.initialize({
      email,
      amount: Math.round(parseFloat(amount) * 100), // Convert to kobo (smallest currency unit)
      reference: `order_${orderId}`,
      name,
      metadata: {
        orderId,
        cartId,
        userId: user.id,
        address: JSON.stringify(address),
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation?id=${orderId}`,
    });

    // Update order status
    await supabase
      .from("orders")
      .update({ payment_reference: response.data.reference })
      .eq("id", orderId);

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your payment" },
      { status: 500 }
    );
  }
}
