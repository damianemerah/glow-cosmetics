"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Order } from "@/types/index";
import { customAlphabet } from "nanoid";
import type { OrderInputData } from "@/types"; // Import types

interface FetchOrdersResult {
    orders: Order[];
    totalPages: number;
    totalCount: number;
}

// Result type for createOrder action
export type CreateOrderResult =
    | {
        success: true;
        orderId: string;
        paymentReference: string;
        paymentMethod: "bank_transfer" | "paystack";
    }
    | { success: false; error: string };
const nanoid = customAlphabet("0123456789", 6);

export async function createOrder(
    input: OrderInputData,
): Promise<CreateOrderResult> {
    if (!input.userId || !input.cartId || input.cartItems.length === 0) {
        return {
            success: false,
            error: "Missing required user, cart, or item data.",
        };
    }

    try {
        // --- 1. Verify Stock Availability ---
        // (Crucial step: prevent overselling)
        const productIds = input.cartItems.map((item) => item.product_id);
        const { data: productsStock, error: stockError } = await supabaseAdmin
            .from("products")
            .select("id, stock_quantity, name")
            .in("id", productIds);

        if (stockError) {
            throw new Error(`Stock check failed: ${stockError.message}`);
        }
        if (!productsStock || productsStock.length !== productIds.length) {
            // This check might be too strict if some products were deleted but still in cart
            console.warn(
                "Stock check: Mismatch between requested product IDs and found products.",
            );
            // Potentially filter cartItems based on productsStock here
        }

        const stockMap = new Map(
            productsStock?.map((p) => [p.id, p.stock_quantity]),
        );

        for (const item of input.cartItems) {
            const availableStock = stockMap.get(item.product_id);
            if (
                availableStock === undefined || availableStock < item.quantity
            ) {
                const productName = productsStock?.find((p) =>
                    p.id === item.product_id
                )?.name || item.product_name;
                return {
                    success: false,
                    error: `Insufficient stock for ${productName}. Only ${
                        availableStock ?? 0
                    } available.`,
                };
            }
        }

        // --- 2. Generate Payment Reference ---
        const paymentReference = `ORD-${nanoid()}`; // Generate reference before insert

        // --- 3. Create Order Record ---
        const orderPayload = {
            user_id: input.userId,
            first_name: input.firstName,
            last_name: input.lastName,
            cart_id: input.cartId,
            total_price: input.totalAmount, // Ensure this includes delivery fee
            shipping_address: input.shippingAddress,
            email: input.email,
            phone: input.phone,
            status: "pending", // Initial status
            payment_reference: paymentReference, // Use generated reference
            payment_method: input.paymentMethod,
            delivery_method: input.deliveryMethod,
            // delivery_fee: input.deliveryFee, // Add if you have this column
        };

        const { data: newOrder, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert(orderPayload)
            .select("id") // Select only the ID
            .single();

        if (orderError) {
            throw new Error(`Order creation failed: ${orderError.message}`);
        }
        if (!newOrder || !newOrder.id) {
            throw new Error("Order creation returned no ID.");
        }

        const orderId = newOrder.id;

        // --- 4. Create Order Items ---
        const orderItemsPayload = input.cartItems.map((item) => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            color: item.color?.name || null,
            status: "incomplete",
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItemsPayload);

        if (itemsError) {
            // Attempt to roll back or mark the order as failed if items fail
            console.error(
                `Failed to insert order items for order ${orderId}:`,
                itemsError,
            );
            await supabaseAdmin.from("orders").update({
                status: "creation_error",
            }).eq("id", orderId);
            throw new Error(
                `Failed to save order items: ${itemsError.message}`,
            );
        }

        // --- 6. Handle User Profile Update (Email Offers) ---
        if (input.emailOffers) {
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .update({ receive_emails: true })
                .eq("user_id", input.userId);
            if (profileError) {
                // Log error but don't fail order
                console.warn(
                    `Failed to update profile email preference for user ${input.userId}:`,
                    profileError.message,
                );
            }
        }

        // --- Success ---
        return {
            success: true,
            orderId: orderId,
            paymentReference: paymentReference,
            paymentMethod: input.paymentMethod,
        };
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : "An unexpected error occurred during order creation.";
        console.error("createOrder Action Error:", message);
        return { success: false, error: message };
    }
}

export async function fetchOrders(
    page: number = 1,
    status: string = "all",
    userSearch: string = "",
): Promise<FetchOrdersResult> {
    const itemsPerPage = 10; // Or make this configurable

    try {
        // --- Build Count Query ---
        let countQuery = supabaseAdmin
            .from("orders")
            .select("*", { count: "exact", head: true }); // Start count query

        // Apply filters to count query
        if (status !== "all") {
            countQuery = countQuery.eq("status", status);
        }
        if (userSearch) {
            const searchTerm = `%${userSearch.trim()}%`;
            // Search across first_name, last_name, email
            countQuery = countQuery.or(
                `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`,
            );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting orders:", countError);
            throw new Error(
                `Database error counting orders: ${countError.message}`,
            );
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // --- Build Data Query ---
        let dataQuery = supabaseAdmin
            .from("orders")
            .select("*"); // Start data query

        // Apply filters to data query (must match count query)
        if (status !== "all") {
            dataQuery = dataQuery.eq("status", status);
        }
        if (userSearch) {
            const searchTerm = `%${userSearch.trim()}%`;
            dataQuery = dataQuery.or(
                `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`,
            );
        }

        // Apply sorting and pagination to data query
        dataQuery = dataQuery
            .order("created_at", { ascending: false })
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        const { data: orders, error: dataError } = await dataQuery;

        if (dataError) {
            console.error("Error fetching orders:", dataError);
            throw new Error(
                `Database error fetching orders: ${dataError.message}`,
            );
        }

        return {
            orders: (orders || []) as Order[], // Type assertion
            totalPages,
            totalCount,
        };
    } catch (error) {
        console.error("Unexpected error in fetchOrders:", error);
        // Return empty state on error or rethrow, depending on desired handling
        return { orders: [], totalPages: 0, totalCount: 0 };
    }
}

// Keep getOrderByRef as is, using supabaseAdmin
export async function getOrderByRef(refId: string): Promise<Order | null> {
    if (!refId) return null;
    try {
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)") // Assuming you need items here too
            .eq("payment_reference", refId)
            .maybeSingle(); // Use maybeSingle to handle null result gracefully

        if (error) {
            console.error("Error fetching order by ref:", error);
            // Don't throw, return null as expected by the client search logic
            return null;
        }

        return data as Order | null; // Type assertion
    } catch (error) {
        console.error("Error in getOrderByRef:", error);
        return null; // Return null on unexpected errors too
    }
}
