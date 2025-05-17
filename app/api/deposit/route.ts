import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Paystack from "paystack";

// Declare the module for TypeScript
declare module "paystack";

const paystackInstance = Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, bookingId, amount, name, userId } = body;
    if (!email || !bookingId || !name || !userId) {
      return NextResponse.json(
        { error: "Email, booking ID, and name are required" },
        { status: 400 },
      );
    }

    // Fetch the booking details from the database
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .eq("booking_id", bookingId);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "An error occurred while processing your payment" },
        { status: 500 },
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or expired" },
        { status: 404 },
      );
    }

    // Initiate payment with Paystack
    const response = await paystackInstance.transaction.initialize({
      email,
      amount: parseInt(amount) * 100,
      reference: bookingId,
      name,
      callback_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://ugosylviacosmetics.co.za"
      }/booking/confirmation?bookingId=${bookingId}`,
      metadata: {
        type: "deposit",
        booking_id: bookingId,
        payment_type: "deposit",
        custom_fields: [
          {
            display_name: "Booking ID",
            variable_name: "booking_id",
            value: bookingId,
          },
        ],
      },
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while processing your payment" },
      { status: 500 },
    );
  }
}
