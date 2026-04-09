import { NextResponse } from 'next/server';
import {
  isOnboarded,
  getWellnessProfile,
  saveOnboardingProfile,
  updateWellnessProfile,
  getMLFormattedData,
} from '../../lib/store';
import { connectDB, WellnessProfileModel } from '../../lib/mongodb';
import { requireAuthenticatedUser } from '../../lib/auth';
import { applyRateLimit, getClientIp } from '../../lib/rate-limit';
import { logApiError, logSuspiciousTraffic } from '../../lib/security-log';

const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`onboarding:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: '/api/user/onboarding', reason: 'onboarding_get_rate_limited' });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const userId = authUser._id.toString();
  const dbConnected = await connectDB();
  if (dbConnected) {
    try {
      const profile = await WellnessProfileModel.findOne({ userId }).lean();
      if (profile) {
        return NextResponse.json({ onboardingComplete: true, profile });
      }
    } catch {
      // fallback to in-memory
    }
  }

  return NextResponse.json({
    onboardingComplete: isOnboarded(),
    profile: getWellnessProfile(),
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`onboarding:post:${ip}:${authUser._id.toString()}`, 30, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/user/onboarding', reason: 'onboarding_post_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const userId = authUser._id.toString();
    const body = await req.json();
    const {
      name, age, sleepHours, workHours, screenTime, activityLevel,
      currentMood, stressLevel, anxietyLevel, meditationFrequency,
      exerciseFrequency, journaling, goals,
    } = body;

    if (!name || !age || !currentMood) {
      return NextResponse.json({ error: 'Name, age, and current mood are required' }, { status: 400 });
    }

    const profileData = {
      name: name.trim(),
      age: Number(age),
      gender: body.gender || 'Prefer not to say',
      sleepHours: Number(sleepHours) || 7,
      workHours: Number(workHours) || 8,
      screenTime: Number(screenTime) || 4,
      activityLevel: activityLevel || 'Medium',
      currentMood: currentMood || 'Okay',
      stressLevel: Number(stressLevel) || 5,
      anxietyLevel: Number(anxietyLevel) || 5,
      meditationFrequency: meditationFrequency || 'Rarely',
      exerciseFrequency: exerciseFrequency || 'Rarely',
      journaling: Boolean(journaling),
      goals: Array.isArray(goals) ? goals : [],
    };

    const profile = saveOnboardingProfile(profileData);

    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await WellnessProfileModel.findOneAndUpdate(
          { userId },
          { ...profileData, userId, completedAt: new Date(), updatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        logApiError({ path: '/api/user/onboarding', method: 'POST', message: err?.message || 'DB save failed' });
      }
    }

    let mlInsights = null;
    try {
      const mlData = getMLFormattedData();
      const mlRes = await fetch(`${ML_SERVICE}/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moods: mlData.moods,
          sleep_logs: mlData.sleep_logs,
          sessions: mlData.sessions,
          current_mood: currentMood,
        }),
      });
      if (mlRes.ok) mlInsights = await mlRes.json();
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      profile,
      mlInsights,
      message: `Welcome, ${profile.name}! Your personalized wellness dashboard is ready.`,
    });
  } catch (e: any) {
    logApiError({ path: '/api/user/onboarding', method: 'POST', message: e?.message || 'Onboarding failed' });
    return NextResponse.json({ error: e.message || 'Onboarding failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const ip = getClientIp(req);

  try {
    const authUser = await requireAuthenticatedUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = applyRateLimit(`onboarding:put:${ip}:${authUser._id.toString()}`, 60, 15 * 60 * 1000);
    if (!rate.allowed) {
      logSuspiciousTraffic({ ip, path: '/api/user/onboarding', reason: 'onboarding_put_rate_limited' });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const userId = authUser._id.toString();
    const body = await req.json();
    const updated = updateWellnessProfile(body);

    const dbConnected = await connectDB();
    if (dbConnected) {
      await WellnessProfileModel.findOneAndUpdate(
        { userId },
        { ...body, updatedAt: new Date() }
      );
    }

    if (!updated) {
      return NextResponse.json({ error: 'No profile found. Complete onboarding first.' }, { status: 400 });
    }

    let mlInsights = null;
    try {
      const mlData = getMLFormattedData();
      const mlRes = await fetch(`${ML_SERVICE}/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moods: mlData.moods,
          sleep_logs: mlData.sleep_logs,
          sessions: mlData.sessions,
          current_mood: updated.currentMood,
        }),
      });
      if (mlRes.ok) mlInsights = await mlRes.json();
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      profile: updated,
      mlInsights,
      message: 'Profile updated. Your dashboard has been refreshed with new insights.',
    });
  } catch (e: any) {
    logApiError({ path: '/api/user/onboarding', method: 'PUT', message: e?.message || 'Update failed' });
    return NextResponse.json({ error: e.message || 'Update failed' }, { status: 500 });
  }
}
