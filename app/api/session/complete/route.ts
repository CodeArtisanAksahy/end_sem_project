import { NextResponse } from "next/server";
import { completeSession, cancelSession, getActiveSession } from "../../lib/store";

export async function POST(request: Request) {
  try {
    const { sessionId, action } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    if (action === "cancel") {
      const session = cancelSession(sessionId);
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Session cancelled.", session });
    }
    const session = completeSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Congratulations! You completed '" + session.title + "' — " + Math.round(session.duration / 60) + " minutes of mindfulness logged.",
      session,
    });
  } catch {
    return NextResponse.json({ error: "Failed to complete session" }, { status: 500 });
  }
}

export async function GET() {
  const active = getActiveSession();
  return NextResponse.json({ activeSession: active });
}
