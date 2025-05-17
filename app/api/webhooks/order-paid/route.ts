// File: app/api/order-paid/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMessageWithFallback } from "@/lib/messaging";
import { format } from "date-fns";
import { formatZAR } from "@/utils";

export type ShippingAddress = {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
};

export async function POST(request: Request) {
    try {
        // 1. Parse payload
        const payload = await request.json();
        const { order_id, user_id, total_price, payment_reference } = payload;
        if (!order_id || !user_id) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // 2. Fetch the order + its items + shipping_address JSONB
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*), shipping_address")
            .eq("id", order_id)
            .single();

        if (orderError || !orderData) {
            console.error("Error fetching order details:", orderError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch order details" },
                { status: 500 },
            );
        }

        // 3. Fetch user profile
        const { data: userData, error: userError } = await supabaseAdmin
            .from("profiles")
            .select("first_name, last_name, email, phone")
            .eq("user_id", user_id)
            .single();

        if (userError || !userData) {
            console.error("Error fetching user data:", userError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch user data" },
                { status: 500 },
            );
        }

        // 4. Fetch admin users
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

        // 5. Format timestamps
        const orderCreatedAt = new Date(orderData.created_at);
        const dateFormatted = format(orderCreatedAt, "MMMM d, yyyy");
        const timeFormatted = format(orderCreatedAt, "hh:mm a");

        // 6. Build the product summary
        const productSummary = (orderData.order_items || [])
            .map((item: { product_name: string; quantity: number }) =>
                `${item.product_name} x${item.quantity}`
            )
            .join(", ");

        // 7. Bundle order details — including the JSONB address
        const orderDetails = {
            orderReference: payment_reference,
            dateFormatted,
            timeFormatted,
            total: total_price,
            items: productSummary,
            paymentMethod: orderData.payment_method?.replace("_", " ") ||
                "Not specified",
            deliveryMethod: orderData.delivery_method,
            shippingAddress: orderData.shipping_address as ShippingAddress,
        };

        // 8. Prepare template variables
        const emailVariables = {
            user: {
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                phone: userData.phone || "Not provided",
            },
            order: {
                orderReference: orderDetails.orderReference,
                dateFormatted: orderDetails.dateFormatted,
                timeFormatted: orderDetails.timeFormatted,
                total: formatZAR(orderDetails.total),
                items: orderDetails.items,
                paymentMethod: orderDetails.paymentMethod,
                deliveryMethod: orderDetails.deliveryMethod,
                shippingAddress: orderDetails.shippingAddress,
            },
            siteUrl: process.env.NEXT_PUBLIC_APP_URL!,
        };

        // 9. Send to every admin
        const emailPromises = adminUsers.map((admin) =>
            sendMessageWithFallback({
                userId: admin.user_id,
                subject: `New Order Payment Received – ${payment_reference}`,
                message: "order-notification.pug",
                variables: emailVariables,
            })
        );
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
