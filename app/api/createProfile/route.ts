import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the POST request handler
export async function POST(req: Request) {
  try {
    const { record } = await req.json();
    const secretKey = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (secretKey !== process.env.HEADER_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 },
      );
    }

    const { id, email, raw_user_meta_data } = record;

    if (!id || !email) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
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
          phone: raw_user_meta_data?.phone,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    // If user opted in to email notifications, add them to Resend contacts
    if (raw_user_meta_data?.receive_emails && email) {
      try {
        // Add contact to Resend
        await resend.contacts.create({
          email: email,
          firstName: raw_user_meta_data?.first_name || "",
          lastName: raw_user_meta_data?.last_name || "",
          // You can add additional fields here if needed
          unsubscribed: false,
          audienceId: process.env.RESEND_AUDIENCE_ID as string, // Add required audienceId
        });

        console.log(`User ${email} added to Resend contacts`);
      } catch (resendError) {
        console.error("Error adding contact to Resend:", resendError);
        // Continue execution - don't fail the whole request for Resend errors
      }
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
        message: "User profile created successfully",
        profile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
