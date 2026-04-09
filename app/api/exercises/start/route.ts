import { NextResponse } from "next/server";
import { startSession } from "../../lib/store";

export async function POST(request: Request) {
  try {
    const { exerciseId, title } = await request.json();
    const session = startSession(
      title || "Exercise",
      "Meditation",
      600
    );
    return NextResponse.json({
      success: true,
      message: "'" + (title || "Exercise") + "' started! Enjoy your practice.",
      session,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start exercise" }, { status: 500 });
  }
}
