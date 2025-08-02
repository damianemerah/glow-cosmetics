import { NextResponse } from "next/server";
import { sendBatchMessages } from "@/lib/messaging";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Define interfaces for type safety
interface Recipient {
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  email_notifications_enabled?: boolean;
}

export async function POST(request: Request) {
  try {
    const messageData = await request.json();

    // Validate the required fields
    if (
      !messageData.recipients.length || !messageData.message ||
      !messageData.channel
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // If recipients are group IDs, fetch actual recipients
    if (
      typeof messageData.recipients[0] === "string" &&
      ["all", "vip", "recent", "inactive"].includes(messageData.recipients[0])
    ) {
      // Define queries based on recipient group
      let query = supabaseAdmin.from("profiles").select(
        "user_id, email, first_name, last_name, email_notifications_enabled, receive_emails",
      );

      // Apply filters based on group
      switch (messageData.recipients[0]) {
        case "all":
          break;
        case "inactive":
          // Customers who haven't made a purchase in 90 days
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          query = query
            .lt("last_purchase_date", ninetyDaysAgo.toISOString());
          break;
      }

      // Apply communication preference filtering
      if (messageData.channel === "email") {
        query = query.eq("email_notifications_enabled", true).not(
          "email",
          "is",
          null,
        );
      } else {
        return NextResponse.json(
          { success: false, error: "Failed to send email" },
          { status: 500 },
        );
      }

      let filteredRecipients;
      const { data: recipients, error } = await query;

      if (messageData.type === "offer" && recipients?.length) {
        filteredRecipients = recipients.filter((recipient) => {
          return recipient.receive_emails;
        });
      } else {
        filteredRecipients = recipients;
      }

      if (error) {
        console.error("Error fetching recipients:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch recipients" },
          { status: 500 },
        );
      }

      // Create a variables object with user_id as keys for targeted substitution
      const variables: Record<string, unknown> = {};

      // Map user data to variables with userId as keys
      (filteredRecipients as Recipient[]).forEach((recipient) => {
        const { first_name, last_name, email, user_id } = recipient;
        variables[user_id] = {
          user: {
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            firstName: first_name || "",
            lastName: last_name || "",
            email: email || "",
          },
        };
      });

      // Assign variables to messageData
      messageData.variables = variables;

      // Transform recipients to the format expected by sendMessage
      let recipientEmails: string[] = [];

      if (messageData.channel === "email") {
        recipientEmails = (filteredRecipients as Recipient[])
          .map((r) => ({
            email: r.email || "",
            userId: r.user_id,
          }))
          .filter((r) => r.email)
          .map((r) => r.email);

        messageData.recipients = recipientEmails;
      } else {
        return NextResponse.json(
          { success: false, error: "Failed to send email" },
          { status: 500 },
        );
      }

      // If no valid recipients found
      if (messageData.recipients.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No valid recipients found with the selected preferences",
          },
          { status: 400 },
        );
      }

      // Use batch sending for groups
      const results = await sendBatchMessages(messageData);
      const result = results[0];

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 },
        );
      }

      // Log the message in the database
      const { error: logError } = await supabaseAdmin.from("message_logs")
        .insert({
          recipients: messageData.recipients.join(","),
          subject: messageData.subject || "",
          message: messageData.message,
          channel: messageData.channel,
          message_id: result.messageId,
          status: result.error ? "partial" : "delivered",
        });

      if (logError) {
        console.error("Error logging message:", logError);
        // We don't fail the request if just the logging fails
      }

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        details: result.error, // Include details about partial sends
      });
    }
    return NextResponse.json(
      { success: false, error: "Invalid recipient type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in messages API route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
