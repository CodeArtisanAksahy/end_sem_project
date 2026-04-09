import { NextResponse } from "next/server";
import { getStatsData, getStore, getMoodHistory, getMLFormattedData, getSleepLogs } from "../lib/store";
import { callMLService, checkMLService } from "../lib/mongodb";
import { geminiInsights, geminiWellnessScore, geminiExerciseRecommendation } from "../lib/gemini";
import { requireAuthenticatedUser } from "../lib/auth";
import { applyRateLimit, getClientIp } from "../lib/rate-limit";
import { logApiError, logSuspiciousTraffic } from "../lib/security-log";

const MOOD_SCORES: Record<string, number> = {
  Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10,
};

export async function GET(request: Request) {
  const authUser = await requireAuthenticatedUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(request);
  const rate = applyRateLimit(`stats:get:${ip}:${authUser._id.toString()}`, 120, 15 * 60 * 1000);
  if (!rate.allowed) {
    logSuspiciousTraffic({ ip, path: "/api/stats", reason: "stats_rate_limited" });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const baseStats = getStatsData();
  const store = getStore();
  const recentMoods = getMoodHistory(14);
  const sleepLogs = getSleepLogs(14);

  // Get ML-formatted data (includes mood, sleep, sessions)
  const mlData = getMLFormattedData();

  // Call Python ML service (if running)
  let mlWellness = null;
  let mlInsights = null;
  let mlRecommendations = null;
  const mlAvailable = await checkMLService();

  if (mlAvailable && mlData.moods.length > 0) {
    const [stress, insights, recs] = await Promise.all([
      callMLService("/predict/stress", mlData),
      callMLService("/generate/insight", { ...mlData, max_insights: 4 }),
      callMLService("/recommend", { ...mlData, current_mood: mlData.moods[0]?.mood }),
    ]);
    mlWellness = stress;
    mlInsights = insights;
    mlRecommendations = recs;
  }

  // ===== GEMINI AI LAYER =====
  // Use Gemini to generate richer insights if Python ML didn't provide them
  let geminiAiInsights: any[] = [];
  let geminiWellness: any = null;
  let geminiRecs: any = null;

  try {
    // Run Gemini calls in parallel
    const [gInsights, gWellness, gRecs] = await Promise.all([
      !mlInsights ? geminiInsights({
        moods: recentMoods,
        sleepLogs,
        sessions: store.sessions,
        stats: store.stats,
        profile: store.wellnessProfile,
      }, 4) : Promise.resolve([]),
      !mlWellness ? geminiWellnessScore({
        moods: recentMoods,
        sleepLogs,
        stats: store.stats,
        profile: store.wellnessProfile,
      }) : Promise.resolve(null),
      !mlRecommendations ? geminiExerciseRecommendation({
        currentMood: recentMoods[0]?.mood || store.wellnessProfile?.currentMood || "Okay",
        stressLevel: store.wellnessProfile?.stressLevel || 5,
        anxietyLevel: store.wellnessProfile?.anxietyLevel || 5,
        recentMoods,
        sleepHours: store.wellnessProfile?.sleepHours || 7,
        activityLevel: store.wellnessProfile?.activityLevel || "Medium",
      }) : Promise.resolve(null),
    ]);

    geminiAiInsights = gInsights;
    geminiWellness = gWellness;
    geminiRecs = gRecs;
  } catch (err: any) {
    logApiError({ path: "/api/stats", method: "GET", message: err?.message || "Gemini layer error" });
  }

  // ===== BUILD RESPONSE =====
  const response: any = {
    ...baseStats,
    ml_available: mlAvailable || geminiAiInsights.length > 0,
    ai_source: mlAvailable ? "python_ml" : geminiAiInsights.length > 0 ? "gemini" : "none",
  };

  // Wellness scores — prefer Python ML, fallback to Gemini 
  const wellness = mlWellness || geminiWellness;
  if (wellness) {
    response.resilience = {
      score: wellness.resilience_score,
      percentile: wellness.percentile || 85,
    };
    response.stress_index = wellness.stress_index;
    response.wellness_score = wellness.wellness_score;
    response.burnout_risk = wellness.burnout_risk;
    response.breakdown = wellness.breakdown;
    response.aiInsight = wellness.one_liner || "";
  }

  // AI Insights — prefer Python ML, fallback to Gemini
  if (mlInsights && mlInsights.insights?.length > 0) {
    response.ai_insights = mlInsights.insights;
    response.badges = mlInsights.badges || response.badges;
  } else if (geminiAiInsights.length > 0) {
    response.ai_insights = geminiAiInsights;
  }

  // Recommendations — prefer Python ML, fallback to Gemini
  if (mlRecommendations) {
    response.recommendations = mlRecommendations;
  } else if (geminiRecs) {
    response.recommendations = {
      primary_recommendation: geminiRecs.primary ? {
        title: geminiRecs.primary.title,
        type: geminiRecs.primary.category,
        duration_minutes: geminiRecs.primary.duration_minutes,
        reason: geminiRecs.primary.reason,
      } : undefined,
      alternatives: geminiRecs.alternatives || [],
      reasoning: geminiRecs.reasoning || [],
    };
  }

  return NextResponse.json(response);
}
