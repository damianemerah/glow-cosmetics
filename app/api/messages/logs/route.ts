import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = Number(searchParams.get("limit") || 50);
        const page = Number(searchParams.get("page") || 1);
        const channel = searchParams.get("channel");
        const status = searchParams.get("status");

        // Calculate pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Start building the query
        let query = supabaseAdmin
            .from("message_logs")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        // Apply filters if provided
        if (channel) {
            query = query.eq("channel", channel);
        }

        if (status) {
            query = query.eq("status", status);
        }

        // Apply pagination
        query = query.range(from, to);

        // Execute the query
        const { data: logs, count, error } = await query;

        if (error) {
            console.error("Error fetching message logs:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch message logs" },
                { status: 500 },
            );
        }

        // Format the logs for the response
        const formattedLogs = logs.map((log) => ({
            id: `MSG-${log.id}`,
            date: new Date(log.created_at).toLocaleDateString(),
            recipients: log.recipients,
            subject: log.subject,
            message: log.message,
            channel: log.channel,
            status: log.status,
            messageId: log.message_id,
        }));

        return NextResponse.json({
            success: true,
            logs: formattedLogs,
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error) {
        console.error("Error in message logs API:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
