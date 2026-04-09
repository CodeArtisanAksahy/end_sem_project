import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: "Password reset link sent to " + email + ". Please check your inbox.",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
