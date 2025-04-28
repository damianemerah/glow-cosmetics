import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMessageWithFallback } from "@/lib/messaging";
import { format } from "date-fns";

export async function POST(request: Request) {
    try {
        // Validate the request
        const payload = await request.json();
        const { order_id, user_id, total_price, payment_reference } = payload;

        if (!order_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Get full order details
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", order_id)
            .single();

        if (orderError || !orderData) {
            console.error("Error fetching order details:", orderError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch order details" },
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

        // Format order data for the notification
        const orderCreatedAt = new Date(orderData.created_at);
        const orderDetails = {
            orderReference: payment_reference,
            dateFormatted: format(orderCreatedAt, "MMMM d, yyyy"),
            timeFormatted: format(orderCreatedAt, "h:mm a"),
            total: total_price,
            items: orderData.order_items,
            paymentMethod: orderData.payment_method?.replace("_", " ") ||
                "Not specified",
        };

        const emailVariables = {
            user: {
                firstName: userData.first_name || orderData.first_name,
                lastName: userData.last_name || orderData.last_name || "",
                email: userData.email || orderData.email,
                phone: userData.phone || orderData.phone || "Not provided",
            },
            booking: {
                serviceName: "Order Payment Received",
                dateFormatted: orderDetails.dateFormatted,
                timeFormatted: orderDetails.timeFormatted,
                specialRequests:
                    `Payment Reference: ${orderDetails.orderReference} | Total: R${
                        orderDetails.total.toFixed(2)
                    }`,
            },
            siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        };

        // Send email to each admin
        const emailPromises = adminUsers.map((admin) => {
            return sendMessageWithFallback({
                userId: admin.user_id,
                subject: `New Order Payment Received - ${payment_reference}`,
                message: "pug-template/emails/booking-notification.pug",
                variables: emailVariables,
                channel: "whatsapp",
            });
        });

        await Promise.all(emailPromises);

        return NextResponse.json({
            success: true,
            message: "Admin notification sent successfully",
        });
    } catch (error) {
        console.error("Error in order-paid webhook:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
