import { NextResponse } from "next/server";
import { startSession, getActiveSession } from "../../lib/store";

export async function POST(request: Request) {
  try {
    const { title, type, duration } = await request.json();
    const active = getActiveSession();
    if (active) {
      return NextResponse.json({
        success: false,
        error: "You already have an active session: " + active.title,
        activeSession: active,
      }, { status: 409 });
    }
    const durationSec = duration || 600;
    const session = startSession(
      title || "Meditation",
      type || "Meditation",
      durationSec
    );
    return NextResponse.json({
      success: true,
      message: "Session '" + session.title + "' started! " + Math.round(durationSec / 60) + " minutes on the clock.",
      session,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
