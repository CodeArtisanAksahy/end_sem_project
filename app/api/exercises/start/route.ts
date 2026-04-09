import { NextResponse } from 'next/server';
import { startSession } from '../../lib/store';
import { requireAuthenticatedUser } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`exercise:start:${ip}:${authUser._id.toString()}`, 90, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/exercises/start', reason: 'exercise_start_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { title } = await request.json();
    const session = startSession(title || 'Exercise', 'Meditation', 600);

    return NextResponse.json({
      success: true,
      message: `'${title || 'Exercise'}' started! Enjoy your practice.`,
      session,
    });
  } catch (err: any) {
    logApiError({ path: '/api/exercises/start', method: 'POST', message: err?.message || 'Failed to start exercise' });
    return NextResponse.json({ error: 'Failed to start exercise' }, { status: 500 });
  }
}
