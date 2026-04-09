import { NextResponse } from 'next/server';
import { getDataCollectionSummary, getMLFormattedData } from '../lib/store';
import { checkMLService, callMLService } from '../lib/mongodb';
import { requireAuthenticatedUser } from '../lib/auth';
import { applyRateLimit, getClientIp } from '../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../lib/security-log';

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`data-summary:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: '/api/data-summary', reason: 'data_summary_rate_limited' });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const summary = getDataCollectionSummary();
    const mlAvailable = await checkMLService();

    const response: any = {
      ...summary,
      ml_service_available: mlAvailable,
    };

    if (mlAvailable && summary.ml_ready) {
      const mlData = getMLFormattedData();
      const dashboard = await callMLService('/dashboard', {
        ...mlData,
        current_mood: mlData.moods[0]?.mood || 'Calm',
      });
      if (dashboard) {
        response.ml_predictions = {
          mood: dashboard.mood,
          wellness: dashboard.wellness,
          insights_count: dashboard.insights?.length || 0,
          recommendations_count: dashboard.recommendations?.all_ranked?.length || 0,
        };
      }
    }

    return NextResponse.json(response);
  } catch (err: any) {
    logApiError({ path: '/api/data-summary', method: 'GET', message: err?.message || 'Data summary failure' });
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 });
  }
}
