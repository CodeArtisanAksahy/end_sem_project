import { NextResponse } from "next/server";
import { getDashboardData, getStore, getMLFormattedData, getDataCollectionSummary, getStatsData, getMoodHistory, getSleepLogs } from "../lib/store";
import { connectDB, MoodModel, SessionModel, SleepLogModel, WellnessProfileModel, callMLService, checkMLService } from "../lib/mongodb";
import { geminiDashboardSummary, geminiWellnessScore, geminiInsights, geminiExerciseRecommendation } from "../lib/gemini";
import { requireAuthenticatedUser } from "../lib/auth";
import { applyRateLimit, getClientIp } from "../lib/rate-limit";
import { logApiError, logSuspiciousTraffic } from "../lib/security-log";

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`dashboard:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: "/api/dashboard", reason: "dashboard_rate_limited" });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userId = authUser._id.toString();

  // Get base dashboard data from in-memory store
  const data = getDashboardData();
  const store = getStore();

  // Try MongoDB
  const dbConnected = await connectDB();
  let dbMoods: any[] = [];
  let dbSessions: any[] = [];
  let dbSleepLogs: any[] = [];

  if (dbConnected) {
    try {
      dbMoods = await MoodModel.find({ userId }).sort({ timestamp: -1 }).limit(90).lean();
      dbSessions = await SessionModel.find({ userId }).sort({ startedAt: -1 }).limit(50).lean();
      dbSleepLogs = await SleepLogModel.find({ userId }).sort({ timestamp: -1 }).limit(30).lean();
      
      const profileInfo = await WellnessProfileModel.findOne({ userId }).lean();
      if (profileInfo) {
        data.onboardingComplete = true;
      } else {
        data.onboardingComplete = false;
      }
    } catch { /* MongoDB query failed, use in-memory */ }
  }

  // Use in-memory data if no DB data
  const moodData = dbMoods.length > 0 ? dbMoods.map(m => ({
    mood: m.mood,
    score: m.score,
    timestamp: m.timestamp?.toISOString?.() || "",
    day_of_week: m.dayOfWeek || 0,
    hour: m.hour || 12,
  })) : store.moods.map(m => ({
    mood: m.mood,
    score: ({"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10} as any)[m.mood] || 50,
    timestamp: m.timestamp,
    day_of_week: new Date(m.timestamp).getDay(),
    hour: new Date(m.timestamp).getHours(),
  }));

  const sessionData = dbSessions.length > 0 ? dbSessions.map(s => ({
    exercise_id: s.exerciseId || "",
    title: s.title,
    type: s.type,
    duration: s.duration,
    completed: s.completed,
    timestamp: s.startedAt?.toISOString?.() || "",
    day_of_week: new Date(s.startedAt).getDay(),
  })) : store.sessions.filter(s => s.status === "completed").map(s => ({
    exercise_id: s.id,
    title: s.title,
    type: s.type,
    duration: s.duration,
    completed: true,
    timestamp: s.startedAt,
    day_of_week: new Date(s.startedAt).getDay(),
  }));

  const inMemoryML = getMLFormattedData();
  const sleepData = dbSleepLogs.length > 0 ? dbSleepLogs.map(s => ({
    hours: s.hours,
    quality: s.quality,
    date: s.date,
    timestamp: s.timestamp?.toISOString?.() || "",
  })) : inMemoryML.sleep_logs;

  // Call ML service for predictions
  let mlData = null;
  const mlAvailable = await checkMLService();

  if (mlAvailable && moodData.length > 0) {
    mlData = await callMLService("/dashboard", {
      moods: moodData,
      sleep_logs: sleepData,
      sessions: sessionData,
      current_mood: moodData[0]?.mood || "Calm",
    });
  }

  // Build response — merge ML data with base dashboard
  const response: any = {
    ...data,
    ml: {
      available: mlAvailable,
      db_connected: dbConnected,
    },
  };

  if (mlData) {
    response.ml.mood_prediction = mlData.mood?.prediction || null;
    response.ml.mood_trend = mlData.mood?.trend || null;
    response.ml.wellness = mlData.wellness || null;
    response.ml.insights = mlData.insights || [];
    response.ml.badges = mlData.badges || [];
    response.ml.recommendations = mlData.recommendations || null;
    response.ml.meta = mlData.meta || {};
    response.ml.source = "python_ml";
  }

  // Add data collection summary and stats
  const stats = getStatsData();
  response.data_summary = getDataCollectionSummary();
  response.goals = stats.goals;
  
  if (!mlData) {
    // ===== GEMINI AI FALLBACK =====
    // If Python ML is offline, use Gemini to generate real AI insights
    if (!response.ml) response.ml = {};
    response.ml.source = "gemini";

    try {
      const recentMoods = getMoodHistory(7);
      const recentSleep = getSleepLogs(7);

      const [gSummary, gWellness, gInsights, gRecs] = await Promise.all([
        geminiDashboardSummary({
          profile: store.wellnessProfile,
          moods: recentMoods,
          sleepLogs: recentSleep,
          stats: store.stats,
        }),
        geminiWellnessScore({
          moods: recentMoods,
          sleepLogs: recentSleep,
          stats: store.stats,
          profile: store.wellnessProfile,
        }),
        geminiInsights({
          moods: recentMoods,
          sleepLogs: recentSleep,
          sessions: store.sessions,
          stats: store.stats,
          profile: store.wellnessProfile,
        }, 3),
        geminiExerciseRecommendation({
          currentMood: recentMoods[0]?.mood || store.wellnessProfile?.currentMood || "Okay",
          stressLevel: store.wellnessProfile?.stressLevel,
          anxietyLevel: store.wellnessProfile?.anxietyLevel,
          recentMoods,
          sleepHours: store.wellnessProfile?.sleepHours,
          activityLevel: store.wellnessProfile?.activityLevel,
        }),
      ]);

      // Wellness score from Gemini
      if (gWellness) {
        response.ml.wellness = {
          resilience_score: gWellness.resilience_score || stats.resilience.score,
          wellness_score: gWellness.wellness_score || 75,
          stress_index: gWellness.stress_index || 30,
          burnout_risk: gWellness.burnout_risk || "low",
          breakdown: gWellness.breakdown || {},
        };
      } else {
        response.ml.wellness = { resilience_score: stats.resilience.score };
      }

      // AI summary from Gemini
      response.ml.insights = gInsights.length > 0
        ? gInsights
        : [{ text: gSummary || stats.aiInsight, type: "general", priority: "medium" }];

      // Recommendations from Gemini
      if (gRecs && gRecs.primary) {
        response.ml.recommendations = {
          primary_recommendation: {
            title: gRecs.primary.title,
            type: gRecs.primary.category,
            duration_minutes: gRecs.primary.duration_minutes,
            reason: gRecs.primary.reason,
          },
          alternatives: gRecs.alternatives || [],
          reasoning: gRecs.reasoning || [],
        };
      } else {
        response.ml.recommendations = [{ title: "Daily Check-in", description: "Keep logging data to sharpen your AI insights." }];
      }

      response.ml.available = true;
    } catch (err) {
      logApiError({ path: "/api/dashboard", method: "GET", message: "Gemini fallback error" });
      // Ultimate fallback — static data
      response.ml.wellness = { resilience_score: stats.resilience.score };
      response.ml.insights = [{ text: stats.aiInsight, type: "general", priority: "medium" }];
      response.ml.recommendations = [{ title: "Daily Check-in", description: "Keep logging data to activate ML insights." }];
      response.ml.source = "static_fallback";
    }
  }

  return NextResponse.json(response);
}


