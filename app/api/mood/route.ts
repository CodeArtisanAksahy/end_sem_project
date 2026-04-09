import { NextResponse } from 'next/server';
import { addMood, getTodayMood, getMoodHistory } from '../lib/store';
import { connectDB, MoodModel, callMLService, checkMLService } from '../lib/mongodb';
import { requireAuthenticatedUser } from '../lib/auth';
import { applyRateLimit, getClientIp } from '../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../lib/security-log';

const MOOD_SCORES: Record<string, number> = {
  Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10,
};
const EMOJI_MAP: Record<string, string> = {
  Radiant: '😄', Calm: '😌', Okay: '😐', Tired: '😴', Anxious: '😰', Stressed: '😤',
};

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`mood:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: '/api/mood', reason: 'mood_get_rate_limited' });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  return NextResponse.json({
    todayMood: getTodayMood(),
    history: getMoodHistory(7),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`mood:post:${ip}:${authUser._id.toString()}`, 60, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/mood', reason: 'mood_post_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { mood, note } = await request.json();
    if (!mood) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
    }

    const entry = addMood(mood, note);

    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await MoodModel.create({
          userId: authUser._id.toString(),
          mood,
          score: MOOD_SCORES[mood] || 50,
          emoji: EMOJI_MAP[mood] || '😊',
          note,
          dayOfWeek: new Date().getDay(),
          hour: new Date().getHours(),
        });
      } catch {
        // fall back to in-memory only
      }
    }

    let mlPrediction = null;
    const mlAvailable = await checkMLService();
    if (mlAvailable) {
      const history = getMoodHistory(30);
      const moodData = history.map(m => ({
        mood: m.mood,
        score: MOOD_SCORES[m.mood] || 50,
        timestamp: m.timestamp,
        day_of_week: new Date(m.timestamp).getDay(),
        hour: new Date(m.timestamp).getHours(),
      }));
      mlPrediction = await callMLService('/predict/mood', {
        moods: moodData,
        days_ahead: 3,
      });
    }

    const response: any = {
      success: true,
      message: `Successfully logged your mood as ${mood}. Thanks for checking in!`,
      entry,
      history: getMoodHistory(5),
      db_stored: dbConnected,
    };

    if (mlPrediction) {
      response.ml_prediction = mlPrediction.prediction;
      response.ml_trend = mlPrediction.trend;
    }

    return NextResponse.json(response);
  } catch (err: any) {
    logApiError({ path: '/api/mood', method: 'POST', message: err?.message || 'Failed to log mood' });
    return NextResponse.json({ error: 'Failed to log mood' }, { status: 500 });
  }
}
