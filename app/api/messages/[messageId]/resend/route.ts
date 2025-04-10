import { NextResponse } from "next/server";
import { type MessageData, sendMessage } from "@/lib/messaging";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const data: MessageData = await request.json();
    const { messageId } = await params;
    console.log(messageId);

    // Validate required fields
    if (!data.recipients || !data.message || !data.channel) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Send the message
    const result = await sendMessage(data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
