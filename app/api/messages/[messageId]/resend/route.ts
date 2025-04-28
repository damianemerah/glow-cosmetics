import { NextResponse } from "next/server";
import { sendBatchMessages } from "@/lib/messaging";
import { createClient } from "@/utils/supabase/server";

/**
 * @function POST
 * @description This API route handles resending messages to users.
 *              It retrieves the original message information from the database,
 *              merges it with the new data, and sends the message again.
 * @param {Request} request - The incoming request object containing messageId and resend data.
 * @param {Object} params - The parameters from the URL, including messageId.
 * @returns {NextResponse} - A response indicating the success or failure of the message resending operation.
 */

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } },
) {
  try {
    const { messageId } = params;
    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 },
      );
    }

    // Retrieve the original message information
    const supabase = await createClient();
    const { data: messageLog, error: fetchError } = await supabase
      .from("message_logs")
      .select("*")
      .eq("message_id", messageId)
      .single();

    if (fetchError || !messageLog) {
      console.error("Error fetching message log:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to find the original message" },
        { status: 404 },
      );
    }

    // Get the resend data from the request
    const resendData = await request.json();

    // Merge the original message data with the resend data
    // For message content, prefer the new content if provided
    const messageData = {
      recipients: resendData.recipients || messageLog.recipients.split(","),
      subject: resendData.subject || messageLog.subject,
      message: resendData.message || messageLog.message,
      channel: resendData.channel || messageLog.channel,
      variables: resendData.variables || {},
    };

    // Send the message
    const results = await sendBatchMessages(messageData);
    const result = results[0];

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    // Log the resent message
    const { error: logError } = await supabase.from("message_logs").insert({
      recipients: Array.isArray(messageData.recipients)
        ? messageData.recipients.join(",")
        : messageData.recipients,
      subject: messageData.subject || "",
      message: messageData.message,
      channel: messageData.channel,
      message_id: result.messageId,
      status: "delivered",
      resent_from: messageId,
    });

    if (logError) {
      console.error("Error logging resent message:", logError);
      // We don't fail the request if just the logging fails
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error in resend message API route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
