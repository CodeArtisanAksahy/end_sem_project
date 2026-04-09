import { NextResponse } from 'next/server';
import { getStore } from '../../lib/store';
import { requireAuthenticatedUser } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../../lib/security-log';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`goals:toggle:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/goals/toggle', reason: 'goal_toggle_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { index } = await request.json();
    const store = getStore();

    if (typeof index !== 'number' || index < 0 || index >= store.goals.length) {
      return NextResponse.json({ error: 'Invalid goal index' }, { status: 400 });
    }

    store.goals[index].done = !store.goals[index].done;

    const completed = store.goals.filter(g => g.done).length;
    const total = store.goals.length;

    return NextResponse.json({
      success: true,
      goals: {
        completed,
        total,
        tasks: store.goals,
      },
    });
  } catch (err: any) {
    logApiError({ path: '/api/goals/toggle', method: 'POST', message: err?.message || 'Goal toggle failed' });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
