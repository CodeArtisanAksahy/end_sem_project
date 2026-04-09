import { NextResponse } from "next/server";
import { connectDB, UserModel } from "../../lib/mongodb";
import { setLoggedIn } from "../../lib/store";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const dbConnected = await connectDB();
    let userId = "user_" + email.replace(/[^a-z0-9]/gi, "");

    if (dbConnected) {
      // Find or create the user in MongoDB
      let user = await UserModel.findOne({ email });
      if (!user) {
        user = await UserModel.create({
          email,
          name: email.split("@")[0],
          // IN REAL APP: hash the password. Here we simplify for the demo
          passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
        });
      }
      userId = user._id.toString();
    }

    // Still maintain in-memory flag as fallback
    setLoggedIn(true, email);

    const response = NextResponse.json({
      success: true,
      message: "Welcome back! Your sanctuary awaits.",
      user: { email, name: email.split("@")[0], id: userId },
    });

    response.cookies.set({
      name: "wellness_userId",
      value: userId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
