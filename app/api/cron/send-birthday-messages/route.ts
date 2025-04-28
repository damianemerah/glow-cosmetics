import { NextResponse } from "next/server";
import { sendMessageWithFallback } from "@/lib/messaging";
import { createClient } from "@/utils/supabase/server";
import path from "path";
import pug from "pug";

// Define interface for user data
interface BirthdayUser {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
}

// This API is intended to be called by a CRON job daily
export async function GET(request: Request) {
    try {
        // Validate that this is called by an authorized source
        // Check for a secret token in the request headers
        const authHeader = request.headers.get("authorization");
        if (
            !authHeader || !authHeader.startsWith("Bearer ") ||
            authHeader.split(" ")[1] !== process.env.CRON_SECRET_TOKEN
        ) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Initialize Supabase client
        const supabase = await createClient();

        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateString = `${month}-${day}`; // MM-DD format

        // Query users whose birthday is today
        const { data: birthdayUsers, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, phone, birth_date")
            .not("birth_date", "is", null)
            .filter("to_char(birth_date, 'MM-DD')", "eq", dateString);

        if (error) {
            console.error("Error fetching users with birthdays today:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to fetch users with birthdays",
                },
                { status: 500 },
            );
        }

        if (!birthdayUsers.length) {
            return NextResponse.json({
                success: true,
                message: "No users with birthdays today",
            });
        }

        // Birthday message templates
        const whatsappTemplate =
            "Happy Birthday, {{user.name}}! 🎂 We hope you have a wonderful day filled with joy and celebration. As a birthday gift, enjoy 20% off your next appointment with us! Simply mention BIRTHDAY20 when booking. - The Glow Cosmetics Team";

        // Use Pug template for email
        const templatePath = path.join(
            process.cwd(),
            "pug-template/emails/birthday.pug",
        );

        // Render the HTML email template with a placeholder that will be replaced with actual user data
        const emailTemplate = `
      <h1>Happy Birthday, {{user.name}}! 🎂</h1>
      <p>Everyone at Glow Cosmetics wishes you a fantastic birthday celebration!</p>
      <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <h3 style="color: #4CAF50; margin-top: 0;">Our Gift to You</h3>
        <p style="font-size: 18px;">As our gift to you, we're offering a special 20% discount on your next appointment with us.</p>
        <p style="font-weight: bold; letter-spacing: 1px; font-size: 20px; background-color: #f0f0f0; display: inline-block; padding: 8px 16px; border-radius: 4px;">BIRTHDAY20</p>
      </div>
      <p>Just mention the discount code when booking your next appointment.</p>
      <p>We hope your day is filled with joy, laughter, and beautiful moments!</p>
      <p>Best wishes,<br>The Glow Cosmetics Team</p>
    `;

        // The website's booking URL
        const bookingUrl = process.env.WEBSITE_URL
            ? `${process.env.WEBSITE_URL}/booking`
            : "https://ugosylviacosmetics.co.za/booking";

        // Send messages to all users with birthdays today
        const results = await Promise.all(
            (birthdayUsers as BirthdayUser[]).map(async (user) => {
                // Prepare variables for template substitution
                const userName = `${user.first_name || ""} ${
                    user.last_name || ""
                }`.trim();

                const variables = {
                    user: {
                        name: userName,
                        firstName: user.first_name,
                        lastName: user.last_name,
                    },
                    userName: userName, // For direct use in Pug template
                    bookingUrl: bookingUrl, // For direct use in Pug template
                };

                try {
                    let messageTemplate;
                    const channel = user.phone ? "whatsapp" : "email";

                    // Use the appropriate template based on the channel
                    if (channel === "whatsapp") {
                        messageTemplate = whatsappTemplate;
                    } else {
                        // For email, use the pug template for better styling
                        try {
                            messageTemplate = pug.renderFile(templatePath, {
                                userName: userName,
                                bookingUrl: bookingUrl,
                            });
                        } catch (templateError) {
                            console.error(
                                "Failed to render Pug template:",
                                templateError,
                            );
                            // Fallback to plain HTML if Pug template fails
                            messageTemplate = emailTemplate;
                        }
                    }

                    // Send with preferred channel
                    const result = await sendMessageWithFallback({
                        userId: user.id,
                        subject: "Happy Birthday from Glow Cosmetics!",
                        message: messageTemplate,
                        variables: variables,
                        channel: channel,
                    });

                    return {
                        userId: user.id,
                        success: result.success,
                        messageId: result.messageId,
                        error: result.error,
                    };
                } catch (error) {
                    console.error(
                        `Error sending birthday message to user ${user.id}:`,
                        error,
                    );
                    return {
                        userId: user.id,
                        success: false,
                        error: error instanceof Error
                            ? error.message
                            : "Unknown error",
                    };
                }
            }),
        );

        // Count successes and failures
        const successCount = results.filter((r) => r.success).length;
        const failures = results.filter((r) => !r.success);

        return NextResponse.json({
            success: true,
            totalUsers: birthdayUsers.length,
            messagesSent: successCount,
            failures: failures.length > 0 ? failures : null,
        });
    } catch (error) {
        console.error("Error in birthday messages API route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
