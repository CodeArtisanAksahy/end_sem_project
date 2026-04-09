import { NextResponse } from 'next/server';
import { completeSession, cancelSession, getActiveSession } from '../../lib/store';
import { requireAuthenticatedUser } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`session:complete:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/session/complete', reason: 'session_complete_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { sessionId, action } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const session = cancelSession(sessionId);
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Session cancelled.', session });
    }

    const session = completeSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: `Congratulations! You completed '${session.title}' — ${Math.round(session.duration / 60)} minutes of mindfulness logged.`,
      session,
    });
  } catch (err: any) {
    logApiError({ path: '/api/session/complete', method: 'POST', message: err?.message || 'Failed to complete session' });
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`session:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: '/api/session/complete', reason: 'session_get_rate_limited' });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const active = getActiveSession();
  return NextResponse.json({ activeSession: active });
}
