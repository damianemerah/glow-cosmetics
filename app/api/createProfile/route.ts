import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Define the POST request handler
export async function POST(req: Request) {
  try {
    const { record } = await req.json();
    const secretKey = req.headers.get("Authorization")?.replace("Bearer ", "");

    console.log(secretKey, secretKey === process.env.HEADER_SECRET, "🔥🔥");

    if (secretKey !== process.env.HEADER_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 }
      );
    }

    const { id, email, raw_user_meta_data } = record;
    console.log(record, "record🔥🔥");

    if (!id || !email) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Start a transaction by inserting profile first
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          user_id: id,
          role: "user",
          email,
          first_name: raw_user_meta_data?.first_name,
          last_name: raw_user_meta_data?.last_name,
          date_of_birth: raw_user_meta_data?.date_of_birth,
          receive_emails: raw_user_meta_data?.receive_emails,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Create a cart for the user
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .insert([{ user_id: id, total_price: 0, status: "active" }])
      .select()
      .single();

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    // (Optional) Insert audit log
    await supabaseAdmin.from("audit_logs").insert([
      {
        user_id: id,
        table_name: "profiles",
        action: "insert",
        new_data: JSON.stringify({ user_id: id, role: "user" }),
      },
    ]);

    return NextResponse.json(
      {
        message: "User profile and cart created successfully",
        profile,
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
