import { NextResponse } from 'next/server';
import { connectDB, UserModel } from '../../lib/mongodb';
import { hashPassword, hashToken, isStrongPassword } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logAuthEvent, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const rate = applyRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/auth/reset-password', reason: 'reset_password_rate_limit_exceeded' });
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Reset token and new password are required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 10 chars and include upper, lower, number, and symbol' }, { status: 400 });
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    const tokenHash = hashToken(String(token));
    const user = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    user.passwordHash = hashPassword(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.sessionTokenHash = undefined;
    user.sessionExpiresAt = undefined;
    await user.save();

    logAuthEvent({ type: 'password_reset_completed', email: user.email, userId: user._id.toString(), ip });

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (err: any) {
    logApiError({ path: '/api/auth/reset-password', method: 'POST', message: err?.message || 'Reset password error' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
