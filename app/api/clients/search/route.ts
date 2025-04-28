import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 3) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Search query must be at least 3 characters",
                },
                { status: 400 },
            );
        }

        // // Search for clients with matching name, email, or phone
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("user_id, first_name, last_name, email, phone")
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .limit(10);

        if (error) {
            console.error("Error searching for clients:", error);
            return NextResponse.json(
                { success: false, error: "Failed to search for clients" },
                { status: 500 },
            );
        }

        // Format clients for the response
        const clients = data.map((client) => ({
            id: client.user_id,
            name: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
            firstName: client.first_name,
            email: client.email || "",
            phone: client.phone || "",
        }));

        return NextResponse.json({
            success: true,
            clients,
        });
    } catch (error) {
        console.error("Error in clients search API:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
