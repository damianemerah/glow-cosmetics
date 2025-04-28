import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Define supported event types
type TwilioMessageStatus =
    | "queued"
    | "sending"
    | "sent"
    | "delivered"
    | "undelivered"
    | "failed"
    | "read";

// interface TwilioMessageStatusUpdatePayload {
//     SmsSid: string;
//     SmsStatus: TwilioMessageStatus;
//     MessageStatus: TwilioMessageStatus;
//     To: string;
//     MessageSid: string;
//     AccountSid: string;
//     From: string;
//     ApiVersion: string;
// }

/**
 * @param request - The incoming request object containing the Twilio status callback payload
 * @description This API route handles Twilio message status webhook events
 * @returns A JSON response indicating success or failure
 */
export async function POST(request: Request) {
    try {
        // Parse the form data from Twilio's webhook (Twilio sends form data, not JSON)
        const formData = await request.formData();

        // Extract relevant information
        const messageSid = formData.get("MessageSid") as string;
        const status = formData.get("MessageStatus") as TwilioMessageStatus ||
            formData.get("SmsStatus") as TwilioMessageStatus;

        if (!messageSid || !status) {
            console.error("Missing required fields:", { messageSid, status });
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        console.log(
            `Received Twilio status update for ${messageSid}: ${status}`,
        );

        // Connect to Supabase
        const supabase = await createClient();

        // Update the message log with the new status
        const { error } = await supabase
            .from("message_logs")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("message_id", messageSid);

        if (error) {
            console.error("Error updating message log:", error);
            return NextResponse.json(
                { success: false, error: "Failed to update message log" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing Twilio webhook:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
