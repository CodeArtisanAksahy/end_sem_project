import { NextResponse } from 'next/server';
import { connectDB, UserModel } from '../../lib/mongodb';
import {
  generateSecureToken,
  getSessionCookieOptions,
  getSessionExpiryDate,
  hashPassword,
  hashToken,
  isStrongPassword,
  isValidEmail,
  verifyPassword,
  SESSION_COOKIE_NAME,
} from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logAuthEvent, logSuspiciousTraffic } from '../../lib/security-log';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const MAX_FAILED_BEFORE_LOCK = 5;
const ACCOUNT_LOCK_MS = 15 * 60 * 1000;
const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const rate = applyRateLimit(`login:ip:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/auth/login', reason: 'login_rate_limit_exceeded' });
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } });
    }

    if (!isValidEmail(normalizedEmail) || !password) {
      return NextResponse.json({ error: 'Valid email and password are required' }, { status: 400 });
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    const now = new Date();
    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      if (!isStrongPassword(password)) {
        return NextResponse.json({ error: 'Password must be at least 10 chars and include upper, lower, number, and symbol' }, { status: 400 });
      }

      const verificationToken = generateSecureToken();
      const verificationTokenHash = hashToken(verificationToken);
      const emailVerificationRequired = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false';

      user = await UserModel.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        passwordHash: hashPassword(password),
        emailVerified: !emailVerificationRequired,
        emailVerificationTokenHash: emailVerificationRequired ? verificationTokenHash : undefined,
        emailVerificationExpiresAt: emailVerificationRequired ? new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS) : undefined,
        failedLoginAttempts: 0,
      });

      logAuthEvent({ type: 'account_created', email: normalizedEmail, userId: user._id.toString(), ip });

      if (emailVerificationRequired) {
        logAuthEvent({ type: 'email_verification_sent', email: normalizedEmail, userId: user._id.toString(), ip });
        return NextResponse.json({
          success: false,
          message: 'Account created. Please verify your email before logging in.',
        }, { status: 202 });
      }
    }

    if (user.lockUntil && user.lockUntil.getTime() > now.getTime()) {
      logAuthEvent({ type: 'login_failure', email: normalizedEmail, userId: user._id.toString(), ip, reason: 'account_locked' });
      return NextResponse.json({ error: 'Account temporarily locked due to failed logins. Try again later.' }, { status: 429 });
    }

    const validPassword = verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_BEFORE_LOCK) {
        user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_MS);
      }
      await user.save();

      logAuthEvent({ type: 'login_failure', email: normalizedEmail, userId: user._id.toString(), ip, reason: 'invalid_password' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.emailVerified) {
      const verificationToken = generateSecureToken();
      user.emailVerificationTokenHash = hashToken(verificationToken);
      user.emailVerificationExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
      await user.save();

      logAuthEvent({ type: 'email_verification_sent', email: normalizedEmail, userId: user._id.toString(), ip });
      return NextResponse.json({ error: 'Email not verified. Please verify your email address first.' }, { status: 403 });
    }

    const sessionToken = generateSecureToken();
    user.sessionTokenHash = hashToken(sessionToken);
    user.sessionExpiresAt = getSessionExpiryDate();
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const response = NextResponse.json({
      success: true,
      message: 'Welcome back! Your sanctuary awaits.',
      user: { email: user.email, name: user.name, id: user._id.toString() },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    logAuthEvent({ type: 'login_success', email: normalizedEmail, userId: user._id.toString(), ip });
    return response;
  } catch (err: any) {
    logApiError({ path: '/api/auth/login', method: 'POST', message: err?.message || 'Unknown login error' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
