import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMessageWithFallback } from "@/lib/messaging";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

const safeFormatDate = (
    dateInput: string | Date | undefined | null,
    formatString: string,
): string => {
    if (!dateInput) return "Invalid Date";
    try {
        const dateObj = typeof dateInput === "string"
            ? new Date(dateInput)
            : dateInput;
        if (isNaN(dateObj.getTime())) {
            return "Invalid Date";
        }
        return format(dateObj, formatString);
    } catch (e) {
        console.error("Error formatting date:", dateInput, e);
        return "Error";
    }
};

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const {
            booking_id,
            user_id,
            deposit_amount,
        } = payload;

        console.log("Payload:💰💰", payload);

        if (!booking_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        const { data: bookingData, error: bookingError } = await supabaseAdmin
            .from("bookings")
            .select("*")
            .eq("booking_id", booking_id)
            .eq("user_id", user_id);

        if (bookingError || !bookingData || bookingData.length === 0) {
            console.error("Error fetching booking details:", bookingError);
            return NextResponse.json(
                {
                    success: false,
                    error: bookingError?.message ||
                        "Failed to fetch booking details or no bookings found",
                },
                { status: 500 },
            );
        }

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin
            .from("profiles")
            .select("first_name, last_name, email, phone")
            .eq("user_id", user_id)
            .single();

        if (userError) {
            console.error("Error fetching user data:", userError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch user data" },
                { status: 500 },
            );
        }

        // Get admin users
        const { data: adminUsers, error: adminError } = await supabaseAdmin
            .from("profiles")
            .select("user_id, email, first_name, last_name")
            .eq("role", "admin");

        if (adminError) {
            console.error("Error fetching admin users:", adminError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch admin users" },
                { status: 500 },
            );
        }

        if (!adminUsers || adminUsers.length === 0) {
            return NextResponse.json(
                { success: false, error: "No admin users found" },
                { status: 404 },
            );
        }

        const isMultipleBookings = bookingData.length > 1;

        // Format booking data for the notification
        const bookingDetails = {
            serviceName: isMultipleBookings
                ? bookingData.map((data) =>
                    data.service_name || "Unknown Service"
                ).join(", ")
                : bookingData[0].service_name || "Unknown Service",

            dateFormatted: isMultipleBookings
                ? bookingData.map((data) =>
                    safeFormatDate(data.booking_time, "MMMM d, yyyy")
                ).join(" | ")
                : safeFormatDate(bookingData[0].booking_time, "MMMM d, yyyy"),

            timeFormatted: isMultipleBookings
                ? bookingData.map((data) =>
                    safeFormatDate(data.booking_time, "hh:mm a")
                ).join(", ")
                : safeFormatDate(bookingData[0].booking_time, "hh:mm a"),

            depositAmount: deposit_amount ?? bookingData[0]?.initial_deposit ??
                0,

            specialRequests: isMultipleBookings
                ? bookingData
                    .map((data) => data.special_requests)
                    .filter(Boolean)
                    .join("; ")
                : bookingData[0]?.special_requests ||
                    `Booking ID: ${booking_id}`,
        };

        if (isMultipleBookings && !bookingDetails.specialRequests) {
            bookingDetails.specialRequests = "No special requests provided.";
        } else if (!isMultipleBookings && !bookingData[0]?.special_requests) {
            bookingDetails.specialRequests = "No special requests provided.";
        }

        const emailVariables = {
            user: {
                firstName: userData.first_name || bookingData[0]?.first_name ||
                    "Client",
                lastName: userData.last_name || bookingData[0]?.last_name || "",
                email: userData.email || bookingData[0]?.email ||
                    "Not provided",
                phone: userData.phone || bookingData[0]?.phone ||
                    "Not provided",
            },
            booking: bookingDetails,
            siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        };

        // Send email/message to each admin
        const messagePromises = adminUsers.map((admin) => {
            return sendMessageWithFallback({
                userId: admin.user_id,
                subject: `Deposit Received - ${bookingDetails.serviceName}`,
                message: "pug-template/emails/deposit-notification.pug",
                variables: emailVariables,
                channel: "email",
            });
        });

        await Promise.all(messagePromises);
        revalidatePath("/bookings");

        return NextResponse.json({
            success: true,
            message: "Admin notification of deposit payment sent successfully",
        });
    } catch (error) {
        console.error("Error in deposit-paid webhook:", error);
        const errorDetails = error instanceof Error
            ? error.message
            : String(error);
        return NextResponse.json(
            { success: false, error: `Internal server error: ${errorDetails}` },
            { status: 500 },
        );
    }
}
