import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Define the POST request handler
export async function POST(req: Request) {
  try {
    const { record } = await req.json();

    // console.log("RECORD-START");
    // console.log("RECORD:", record);
    // console.log("RECORD-END");

    const secretKey = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (secretKey !== process.env.HEADER_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 },
      );
    }

    const appMeta = record.raw_app_meta_data;
    //Handle Auth Providers separetly
    if (
      appMeta?.providers.includes("google") ||
      appMeta.providers.includes("apple")
    ) {
      //Google auth
      if (appMeta.provider === "google") {
        const { id, email, raw_user_meta_data } = record;

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert([
            {
              user_id: id,
              role: "user",
              email,
              receive_emails: false,
              ...(raw_user_meta_data?.avatar_url
                ? { avatar: raw_user_meta_data.avatar_url }
                : {}),
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

        return NextResponse.json(
          {
            message: "User profile created successfully",
            profile,
          },
          { status: 200 },
        );
      }
      // if (appMeta.provider === "apple") {
      //   //handle apple auth
      //
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
          receive_emails: raw_user_meta_data?.receive_emails || false,
          phone: raw_user_meta_data?.phone,
          ...(raw_user_meta_data?.avatar_url
            ? { avatar: raw_user_meta_data.avatar_url }
            : {}),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.log(profileError, "🎈🎈");
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

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
