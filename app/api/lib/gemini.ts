// Centralized Gemini AI Service
// Used across: Companion Chat, AI Insights, Exercise Recommendations, Dashboard

import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// ========== SYSTEM PROMPTS ==========

const COMPANION_SYSTEM_PROMPT = `You are "Serene Guide", a warm, empathetic AI wellness companion inside the "Serene Sanctuary" mental health app. 

Your personality:
- Deeply empathetic, warm, and non-judgmental
- You use metaphors and gentle language
- You reference data when available but never overwhelm with numbers
- You give actionable, specific advice
- You speak like a kind therapist, not a robot
- You use relevant emojis sparingly to add warmth (1-3 per response)
- Keep responses concise (2-4 paragraphs max)
- NEVER diagnose conditions — always suggest professional help for serious issues

Important: You have access to the user's real wellness data. Use it to personalize your responses.`;

const INSIGHTS_SYSTEM_PROMPT = `You are an AI wellness analyst for the "Serene Sanctuary" app. Your job is to analyze user wellness data and produce clear, actionable insights.

Rules:
- Be specific and data-driven — reference actual numbers
- Provide exactly the number of insights requested
- Each insight should have: a category (mood, sleep, activity, stress, general), a priority (high/medium/low), and a clear actionable text
- Be encouraging but honest
- Keep each insight to 1-2 sentences
- Return valid JSON only`;

const EXERCISE_SYSTEM_PROMPT = `You are a wellness exercise recommender for "Serene Sanctuary". Based on the user's current mood, stress levels, and activity history, suggest the best exercises.

Rules:
- Recommend exercises from these categories: Meditation, Breathing, Journaling, Sleep
- Prioritize what the user needs most right now
- Be specific about why each exercise helps
- Return valid JSON only`;

// ========== CORE FUNCTIONS ==========

export async function geminiChat(
  userMessage: string,
  context: {
    userName?: string;
    recentMoods?: any[];
    sleepLogs?: any[];
    stats?: any;
    wellnessProfile?: any;
    mlInsights?: any;
  }
): Promise<string> {
  try {
    const model = getGeminiModel();
    const contextStr = buildContextString(context);

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `SYSTEM CONTEXT: ${COMPANION_SYSTEM_PROMPT}\n\nUSER DATA:\n${contextStr}` }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm Serene Guide, ready to provide personalized wellness support based on the user's data. I'll be warm, empathetic, and actionable in my responses." }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();
    return response;
  } catch (error: any) {
    console.error("[Gemini Chat] Error:", error.message);
    return "";  // Return empty to trigger fallback
  }
}

export async function geminiInsights(
  data: {
    moods?: any[];
    sleepLogs?: any[];
    sessions?: any[];
    stats?: any;
    profile?: any;
  },
  count: number = 4
): Promise<any[]> {
  try {
    const model = getGeminiModel();
    const prompt = `${INSIGHTS_SYSTEM_PROMPT}

Here is the user's wellness data:
- Recent moods (last 7 days): ${JSON.stringify(data.moods?.slice(0, 7) || [])}
- Sleep logs: ${JSON.stringify(data.sleepLogs?.slice(0, 7) || [])}
- Sessions completed: ${data.stats?.totalSessions || 0}
- Total mindful minutes: ${data.stats?.totalMinutes || 0}
- Current streak: ${data.stats?.currentStreak || 0} days
- Profile: ${JSON.stringify(data.profile || {})}

Generate exactly ${count} personalized AI insights. Return ONLY a JSON array like:
[
  {"type": "mood_pattern", "priority": "high", "text": "Your mood has been..."},
  {"type": "sleep_correlation", "priority": "medium", "text": "Your sleep data shows..."}
]

Types can be: mood_pattern, sleep_correlation, activity_insight, stress_warning, positive_trend, recommendation, streak_momentum.
Priorities: high, medium, low.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error: any) {
    console.error("[Gemini Insights] Error:", error.message);
    return [];
  }
}

export async function geminiExerciseRecommendation(
  data: {
    currentMood?: string;
    stressLevel?: number;
    anxietyLevel?: number;
    recentMoods?: any[];
    sleepHours?: number;
    activityLevel?: string;
    timeOfDay?: string;
  }
): Promise<any> {
  try {
    const model = getGeminiModel();
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const prompt = `${EXERCISE_SYSTEM_PROMPT}

User's current state:
- Mood: ${data.currentMood || "Okay"}
- Stress level: ${data.stressLevel || 5}/10
- Anxiety level: ${data.anxietyLevel || 5}/10
- Recent moods: ${JSON.stringify(data.recentMoods?.slice(0, 5) || [])}
- Average sleep: ${data.sleepHours || 7} hours
- Activity level: ${data.activityLevel || "Medium"}
- Time of day: ${timeOfDay}

Recommend the best exercise. Return ONLY JSON like:
{
  "primary": {"title": "...", "category": "Meditation", "duration_minutes": 10, "reason": "Why this helps"},
  "alternatives": [
    {"title": "...", "category": "Breathing", "duration_minutes": 5, "reason": "..."},
    {"title": "...", "category": "Journaling", "duration_minutes": 8, "reason": "..."}
  ],
  "reasoning": ["Based on your stress...", "Your sleep pattern suggests..."]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error: any) {
    console.error("[Gemini Exercise] Error:", error.message);
    return null;
  }
}

export async function geminiDashboardSummary(
  data: {
    profile?: any;
    moods?: any[];
    sleepLogs?: any[];
    stats?: any;
  }
): Promise<string> {
  try {
    const model = getGeminiModel();
    const prompt = `You are a wellness AI. Given this user's data, write a single personalized insight sentence (max 30 words) for their dashboard. Be warm, specific, and actionable.

Data:
- Name: ${data.profile?.name || "User"}
- Recent moods: ${JSON.stringify(data.moods?.slice(0, 5) || [])}
- Avg sleep: ${data.sleepLogs?.length ? (data.sleepLogs.reduce((s: number, l: any) => s + l.hours, 0) / data.sleepLogs.length).toFixed(1) : "N/A"} hours
- Sessions: ${data.stats?.totalSessions || 0}
- Streak: ${data.stats?.currentStreak || 0} days

Return ONLY the insight text, nothing else.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error: any) {
    console.error("[Gemini Summary] Error:", error.message);
    return "";
  }
}

export async function geminiWellnessScore(
  data: {
    moods?: any[];
    sleepLogs?: any[];
    stats?: any;
    profile?: any;
  }
): Promise<any> {
  try {
    const model = getGeminiModel();
    const prompt = `You are a wellness scoring AI. Analyze this user data and return a wellness assessment.

Data:
- Moods (last 7 days): ${JSON.stringify(data.moods?.slice(0, 7) || [])}
- Sleep logs: ${JSON.stringify(data.sleepLogs?.slice(0, 7) || [])}
- Total sessions: ${data.stats?.totalSessions || 0}
- Streak: ${data.stats?.currentStreak || 0}
- Profile stress: ${data.profile?.stressLevel || 5}/10
- Profile anxiety: ${data.profile?.anxietyLevel || 5}/10
- Activity level: ${data.profile?.activityLevel || "Medium"}

Return ONLY JSON:
{
  "wellness_score": 75,
  "stress_index": 30,
  "resilience_score": 7.5,
  "burnout_risk": "low",
  "breakdown": {
    "mood_stability": 70,
    "sleep_quality": 80,
    "activity_level": 60,
    "consistency": 75
  },
  "one_liner": "A short encouraging insight"
}

Be realistic based on actual data. Scores 0-100, resilience 0-10, burnout_risk: low/moderate/high.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error: any) {
    console.error("[Gemini Wellness] Error:", error.message);
    return null;
  }
}

// ========== HELPERS ==========

function buildContextString(context: any): string {
  const parts: string[] = [];

  if (context.userName) parts.push(`User's name: ${context.userName}`);

  if (context.recentMoods?.length) {
    parts.push(`Recent moods: ${context.recentMoods.slice(0, 5).map((m: any) => `${m.mood} (${new Date(m.timestamp).toLocaleDateString()})`).join(", ")}`);
  }

  if (context.sleepLogs?.length) {
    const avgSleep = context.sleepLogs.reduce((s: number, l: any) => s + l.hours, 0) / context.sleepLogs.length;
    parts.push(`Average sleep: ${avgSleep.toFixed(1)} hours/night`);
  }

  if (context.stats) {
    parts.push(`Sessions: ${context.stats.totalSessions}, Streak: ${context.stats.currentStreak} days, Total minutes: ${context.stats.totalMinutes}`);
  }

  if (context.wellnessProfile) {
    const p = context.wellnessProfile;
    parts.push(`Profile: Age ${p.age}, Stress ${p.stressLevel}/10, Anxiety ${p.anxietyLevel}/10, Sleep ${p.sleepHours}h, Activity: ${p.activityLevel}`);
    if (p.goals?.length) parts.push(`Goals: ${p.goals.join(", ")}`);
  }

  if (context.mlInsights) {
    parts.push(`ML wellness score: ${context.mlInsights.wellness_score || "N/A"}`);
  }

  return parts.join("\n");
}

export default { geminiChat, geminiInsights, geminiExerciseRecommendation, geminiDashboardSummary, geminiWellnessScore };
