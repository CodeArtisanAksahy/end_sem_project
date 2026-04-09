import { NextResponse } from 'next/server';
import { connectDB, UserModel } from '../../lib/mongodb';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { generateSecureToken, hashToken, isValidEmail } from '../../lib/auth';
import { logApiError, logAuthEvent, logSuspiciousTraffic } from '../../lib/security-log';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const rate = applyRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/auth/forgot-password', reason: 'forgot_password_rate_limit_exceeded' });
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const dbConnected = await connectDB();
    if (dbConnected) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (user) {
        const resetToken = generateSecureToken();
        user.passwordResetTokenHash = hashToken(resetToken);
        user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save();

        // Integrate with email provider in deployment; token intentionally not returned to client.
        logAuthEvent({
          type: 'password_reset_requested',
          email: normalizedEmail,
          userId: user._id.toString(),
          ip,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
  } catch (err: any) {
    logApiError({ path: '/api/auth/forgot-password', method: 'POST', message: err?.message || 'Forgot password error' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
