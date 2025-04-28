"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function getOrderByRef(refId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .eq("payment_reference", refId)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error("Error in getOrderById:", error);
        throw error;
    }
}

// 2. Try to find matching profile based on string input
// const { data: profiles, error: profileError } = await supabaseAdmin
// .from("profiles")
// .select("user_id, first_name, last_name, email, phone")
// .or(`first_name.ilike.%${str}%,last_name.ilike.%${str}%,email.ilike.%${str}%,phone.ilike.%${str}%`)
// .limit(10);

// if (profileError || !profiles || profiles.length === 0) {
// console.warn("No matching profile found:", profileError?.message);
// throw new Error("No order or profile match found.");
// }

// // 3. Search for the most recent order by user ID
// const { data: orderByUser, error: orderError } = await supabaseAdmin
// .from("orders")
// .select("*, order_items(*)")
// .in("user_id", profiles.map((p) => p.user_id))
// .order("created_at", { ascending: false })
// .limit(1)
// .single();

// if (orderError || !orderByUser) {
// console.error(
//     "No order found by matched user(s):",
//     orderError?.message,
// );
// throw new Error("No order found matching user info.");
// }

// return orderByUser;

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from("orders")
            .update({ status })
            .eq("id", orderId)
            .select()
            .single();

        if (error) {
            console.error("Error updating order status:", error);
            throw new Error(error.message);
        }

        revalidatePath("/admin/orders");
        return data;
    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        throw error;
    }
}

// export const fetchOrders = unstable_cache(
//     async (page: number = 1, filter: string = "all") => {
//         const itemsPerPage = 10;

//         try {
//             // Get total count for pagination
//             const { count, error: countError } = await supabaseAdmin
//                 .from("orders")
//                 .select("*", { count: "exact", head: true });

//             if (countError) {
//                 throw countError;
//             }

//             // Build query
//             let query = supabaseAdmin
//                 .from("orders")
//                 .select("*")
//                 .order("created_at", { ascending: false });

//             // Apply status filter if not 'all'
//             if (filter !== "all") {
//                 query = query.eq("status", filter);
//             }

//             // Apply pagination
//             const { data, error } = await query
//                 .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

//             if (error) {
//                 throw error;
//             }

//             return {
//                 orders: data || [],
//                 totalPages: count ? Math.ceil(count / itemsPerPage) : 0,
//                 currentPage: page,
//             };
//         } catch (error) {
//             console.error("Error fetching orders:", error);
//             throw error;
//         }
//     },
//     ["orders-list"],
//     { revalidate: 60, tags: ["orders"] }, // Cache for 60 seconds
// );
