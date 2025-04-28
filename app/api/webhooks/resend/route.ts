import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Webhook } from "svix";
import { Resend } from "resend";

// Define supported event types
type ResendEvent =
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.clicked"
    | "email.opened";

interface ResendWebhookPayload {
    created_at: string;
    data: {
        email_id: string;
        recipient: string;
        tags?: Record<string, string>;
        to?: string[];
        from?: string;
        subject?: string;
        message?: string;
        clicked_link?: string;
    };
    type: ResendEvent;
}

/**
 * @param request - The incoming request object containing the Resend webhook payload.
 * @description This API route handles the Resend webhook events. It verifies the signature,
 * @returns
 */

export async function POST(request: Request) {
    console.log("Received Resend webhook event:📬📬");
    try {
        const svixId = request.headers.get("svix-id");
        const signature = request.headers.get("svix-signature");
        const svixTimestamp = request.headers.get("svix-timestamp");

        if (!svixId || !signature || !svixTimestamp) {
            return NextResponse.json(
                { success: false, error: "Missing required headers" },
                { status: 401 },
            );
        }
        const headers = {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": signature,
        };
        const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET as string);

        // Get the raw request body
        const payload = await request.json();
        const rawBody = JSON.stringify(payload);

        // Verify the webhook signature
        const isValid = wh.verify(rawBody, headers);

        console.log("Signature valid🥂🥂", isValid);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 401 },
            );
        }

        // Now we can trust the payload
        const event = payload as ResendWebhookPayload;

        console.log("event:💌💌", event);

        // Connect to Supabase
        const supabase = await createClient();

        // Map Resend events to message_logs status
        let status: string;
        switch (event.type) {
            case "email.bounced":
                status = "failed";
                break;
            case "email.complained":
                status = "complaint";
                break;
            case "email.delivered":
                status = "delivered";
                break;
            case "email.delivery_delayed":
                status = "delayed";
                break;
            case "email.opened":
                status = "opened";
                break;
            case "email.clicked":
                status = "clicked";
                break;
            default:
                status = event.type.replace("email.", "");
        }

        // Update the message log
        const { error } = await supabase
            .from("message_logs")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("message_id", event.data.email_id);

        if (error) {
            console.error("Error updating message log:", error);
            return NextResponse.json(
                { success: false, error: "Failed to update message log" },
                { status: 500 },
            );
        }

        // Initialize Resend client to manage audiences
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Handle hard bounce or complaint events - update user preferences
        if (
            event.type === "email.bounced" || event.type === "email.complained"
        ) {
            // Find the user by email
            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("user_id, email")
                .eq("email", event.data.recipient)
                .single();

            if (!userError && userData) {
                // Update user preferences to unsubscribe from emails
                await supabase
                    .from("profiles")
                    .update({
                        email_notifications_enabled: false,
                        receive_emails: false,
                    })
                    .eq("user_id", userData.user_id);

                // Also remove from Resend audience
                try {
                    if (process.env.RESEND_AUDIENCE_ID) {
                        await resend.contacts.remove({
                            audienceId: process.env.RESEND_AUDIENCE_ID,
                            email: userData.email,
                        });
                        console.log(
                            `Removed ${userData.email} from Resend audience due to ${event.type}`,
                        );
                    }
                } catch (resendError) {
                    console.error(
                        "Error removing contact from Resend:",
                        resendError,
                    );
                    // Continue even if Resend operation fails
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error processing Resend webhook:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
