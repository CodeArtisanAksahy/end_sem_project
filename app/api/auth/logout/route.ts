import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB, UserModel } from '../../lib/mongodb';
import { getSessionCookieOptions, hashToken, SESSION_COOKIE_NAME } from '../../lib/auth';
import { logApiError, logAuthEvent } from '../../lib/security-log';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await connectDB();
      const sessionHash = hashToken(sessionToken);
      const user = await UserModel.findOne({ sessionTokenHash: sessionHash });
      if (user) {
        user.sessionTokenHash = undefined;
        user.sessionExpiresAt = undefined;
        await user.save();
        logAuthEvent({ type: 'logout', email: user.email, userId: user._id.toString() });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "You've been logged out. Take care!",
    });

    response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
    response.cookies.set('auth_token', '', getSessionCookieOptions(0));
    response.cookies.set('refresh_token', '', getSessionCookieOptions(0));
    response.cookies.set('wellness_userId', '', getSessionCookieOptions(0));

    return response;
  } catch (err: any) {
    logApiError({ path: '/api/auth/logout', method: 'POST', message: err?.message || 'Logout failed' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
