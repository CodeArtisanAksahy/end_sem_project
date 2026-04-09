import { NextResponse } from 'next/server';
import { startSession, getActiveSession } from '../../lib/store';
import { requireAuthenticatedUser } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`session:start:${ip}:${authUser._id.toString()}`, 90, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/session/start', reason: 'session_start_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { title, type, duration } = await request.json();
    const active = getActiveSession();
    if (active) {
      return NextResponse.json({
        success: false,
        error: `You already have an active session: ${active.title}`,
        activeSession: active,
      }, { status: 409 });
    }

    const durationSec = duration || 600;
    const session = startSession(title || 'Meditation', type || 'Meditation', durationSec);

    return NextResponse.json({
      success: true,
      message: `Session '${session.title}' started! ${Math.round(durationSec / 60)} minutes on the clock.`,
      session,
    });
  } catch (err: any) {
    logApiError({ path: '/api/session/start', method: 'POST', message: err?.message || 'Failed to start session' });
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
