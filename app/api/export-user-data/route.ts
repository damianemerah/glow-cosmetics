// app/api/export-user-data/route.ts
import { exportUserData } from "@/actions/dashboardAction";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json(
            { success: false, error: "Missing user ID" },
            { status: 400 },
        );
    }

    const result = await exportUserData(userId);
    return NextResponse.json(result);
}
