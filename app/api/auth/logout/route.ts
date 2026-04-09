import { NextResponse } from "next/server";
import { setLoggedIn } from "../../lib/store";

export async function POST() {
  try {
    setLoggedIn(false);
    const response = NextResponse.json({
      success: true,
      message: "You've been logged out. Take care!",
    });
    response.cookies.set({ name: "auth_token", value: "", httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set({ name: "refresh_token", value: "", httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set({ name: "wellness_userId", value: "", httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
