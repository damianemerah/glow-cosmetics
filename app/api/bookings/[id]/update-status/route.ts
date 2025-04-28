import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const { id: bookingId } = await params;
        const { sent_confirmation, sent_thanks } = await request.json();

        // Build the update object based on what was provided
        const updateData: {
            sent_confirmation?: boolean;
            sent_thanks?: boolean;
        } = {};

        if (sent_confirmation !== undefined) {
            updateData.sent_confirmation = sent_confirmation;
        }

        if (sent_thanks !== undefined) {
            updateData.sent_thanks = sent_thanks;
        }

        // Update the booking status
        const { data, error } = await supabaseAdmin
            .from("bookings")
            .update(updateData)
            .eq("id", bookingId)
            .select();

        if (error) {
            console.error("Error updating booking status:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            booking: data[0],
        });
    } catch (error) {
        console.error("Error in update-status API route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
