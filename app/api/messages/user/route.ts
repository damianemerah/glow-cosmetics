import { NextResponse } from "next/server";
import { sendMessageWithFallback } from "@/lib/messaging";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
    try {
        const { userId, subject, message, variables, channel, type } =
            await request
                .json();

        // Validate the required fields
        if (!userId || !message) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Use the sendMessageWithFallback function that handles MCP and channel fallback
        const result = await sendMessageWithFallback({
            userId,
            subject,
            message,
            variables,
            channel,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 },
            );
        }

        // Log the message in the database

        // Fetch the user's details to log properly
        const { data: user, error: userError } = await supabaseAdmin
            .from("profiles")
            .select("email, receive_emails")
            .eq("user_id", userId)
            .single();

        if (type === "offer" && !user?.receive_emails) {
            return NextResponse.json({
                success: false,
                message: "User has opted out of receiving offers",
            }, { status: 400 });
        }

        if (userError) {
            console.error(
                "Error fetching user details for logging:",
                userError,
            );
            // Continue with partial logging info
        }

        const recipients = user
            ? (!result.messageId?.startsWith("wh") && user.email)
            : userId;

        const { error: logError } = await supabaseAdmin.from("message_logs")
            .insert({
                recipients: recipients,
                subject: subject || "",
                message,
                channel,
                message_id: result.messageId,
                status: "sending",
                user_id: userId,
            });

        if (logError) {
            console.error("Error logging message:", logError);
            // We don't fail the request if just the logging fails
        }

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
        });
    } catch (error) {
        console.error("Error in messages/user API route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
