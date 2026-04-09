import { NextResponse } from 'next/server';
import { addSleepLog, getSleepLogs, getTodaySleep, getMLFormattedData } from '../lib/store';
import { connectDB, SleepLogModel, callMLService, checkMLService } from '../lib/mongodb';
import { requireAuthenticatedUser } from '../lib/auth';
import { applyRateLimit, getClientIp } from '../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../lib/security-log';

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`sleep:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: '/api/sleep', reason: 'sleep_get_rate_limited' });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const todaySleep = getTodaySleep();
  const history = getSleepLogs(14);
  return NextResponse.json({ todaySleep, history });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`sleep:post:${ip}:${authUser._id.toString()}`, 60, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/sleep', reason: 'sleep_post_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { hours, quality, notes } = await request.json();

    if (!hours || hours < 0 || hours > 24) {
      return NextResponse.json({ error: 'Valid sleep hours (0-24) required' }, { status: 400 });
    }

    const qualityScore = quality || Math.round(Math.min(10, Math.max(1, (hours - 3) / 0.7)));
    const entry = addSleepLog(hours, qualityScore, notes);

    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await SleepLogModel.findOneAndUpdate(
          { userId: authUser._id.toString(), date: entry.date },
          {
            userId: authUser._id.toString(),
            hours,
            quality: qualityScore,
            date: entry.date,
            timestamp: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch {
        // fall back to in-memory only
      }
    }

    let mlUpdate = null;
    const mlAvailable = await checkMLService();
    if (mlAvailable) {
      const mlData = getMLFormattedData();
      mlUpdate = await callMLService('/predict/stress', mlData);
    }

    const response: any = {
      success: true,
      message: `Logged ${hours} hours of sleep${qualityScore >= 7 ? ' — great rest!' : qualityScore >= 5 ? '.' : ' — aim for more rest tonight.'}`,
      entry,
      db_stored: dbConnected,
    };

    if (mlUpdate) {
      response.ml_update = {
        stress_index: mlUpdate.stress_index,
        wellness_score: mlUpdate.wellness_score,
        sleep_quality_metric: mlUpdate.breakdown?.sleep_quality,
      };
    }

    return NextResponse.json(response);
  } catch (err: any) {
    logApiError({ path: '/api/sleep', method: 'POST', message: err?.message || 'Failed to log sleep' });
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}
