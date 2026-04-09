import { NextResponse } from 'next/server';
import { connectDB, UserModel } from '../../lib/mongodb';
import { hashToken } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logAuthEvent, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const rate = applyRateLimit(`verify-email:${ip}`, 20, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/auth/verify-email', reason: 'verify_email_rate_limit_exceeded' });
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    const tokenHash = hashToken(String(token));
    const user = await UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    logAuthEvent({ type: 'email_verified', email: user.email, userId: user._id.toString(), ip });

    return NextResponse.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err: any) {
    logApiError({ path: '/api/auth/verify-email', method: 'POST', message: err?.message || 'Verify email error' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
