import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isOnboarded,
  getWellnessProfile,
  saveOnboardingProfile,
  updateWellnessProfile,
  getMLFormattedData,
} from "../../lib/store";
import { connectDB, WellnessProfileModel } from "../../lib/mongodb";

const ML_SERVICE = "http://localhost:8000";

// GET — check onboarding status + get profile
export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("wellness_userId")?.value || "user_001";

  const dbConnected = await connectDB();
  if (dbConnected) {
    try {
      const profile = await WellnessProfileModel.findOne({ userId }).lean();
      if (profile) {
        return NextResponse.json({
          onboardingComplete: true,
          profile,
        });
      }
    } catch { /* fallback to memory */ }
  }

  const onboarded = isOnboarded();
  const profile = getWellnessProfile();
  return NextResponse.json({
    onboardingComplete: onboarded,
    profile,
  });
}

// POST — save full onboarding profile + trigger ML analysis
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("wellness_userId")?.value || "user_001";
    const body = await req.json();

    // Validate required fields
    const { name, age, sleepHours, workHours, screenTime, activityLevel,
      currentMood, stressLevel, anxietyLevel, meditationFrequency,
      exerciseFrequency, journaling, goals } = body;

    if (!name || !age || !currentMood) {
      return NextResponse.json({ error: "Name, age, and current mood are required" }, { status: 400 });
    }

    // Save to store
    const profileData = {
      name: name.trim(),
      age: Number(age),
      gender: body.gender || "Prefer not to say",
      sleepHours: Number(sleepHours) || 7,
      workHours: Number(workHours) || 8,
      screenTime: Number(screenTime) || 4,
      activityLevel: activityLevel || "Medium",
      currentMood: currentMood || "Okay",
      stressLevel: Number(stressLevel) || 5,
      anxietyLevel: Number(anxietyLevel) || 5,
      meditationFrequency: meditationFrequency || "Rarely",
      exerciseFrequency: exerciseFrequency || "Rarely",
      journaling: Boolean(journaling),
      goals: Array.isArray(goals) ? goals : [],
    };
    
    let profile = saveOnboardingProfile(profileData);

    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await WellnessProfileModel.findOneAndUpdate(
          { userId },
          { ...profileData, userId, completedAt: new Date(), updatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("Failed to save onboarding to DB", err);
      }
    }

    // Trigger ML analysis with the seeded data
    let mlInsights = null;
    try {
      const mlData = getMLFormattedData();
      const mlRes = await fetch(`${ML_SERVICE}/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moods: mlData.moods,
          sleep_logs: mlData.sleep_logs,
          sessions: mlData.sessions,
          current_mood: currentMood,
        }),
      });
      if (mlRes.ok) {
        mlInsights = await mlRes.json();
      }
    } catch {
      // ML service not available — we'll compute insights client-side
    }

    return NextResponse.json({
      success: true,
      profile,
      mlInsights,
      message: `Welcome, ${profile.name}! Your personalized wellness dashboard is ready.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Onboarding failed" }, { status: 500 });
  }
}

// PUT — update existing profile (daily check-ins)
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("wellness_userId")?.value || "user_001";
    const body = await req.json();
    
    // In-memory update
    const updated = updateWellnessProfile(body);

    const dbConnected = await connectDB();
    if (dbConnected) {
      await WellnessProfileModel.findOneAndUpdate(
        { userId },
        { ...body, updatedAt: new Date() }
      );
    }

    if (!updated) {
      return NextResponse.json({ error: "No profile found. Complete onboarding first." }, { status: 400 });
    }

    // Re-run ML with updated data
    let mlInsights = null;
    try {
      const mlData = getMLFormattedData();
      const mlRes = await fetch(`${ML_SERVICE}/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moods: mlData.moods,
          sleep_logs: mlData.sleep_logs,
          sessions: mlData.sessions,
          current_mood: updated.currentMood,
        }),
      });
      if (mlRes.ok) {
        mlInsights = await mlRes.json();
      }
    } catch {
      // ML service unavailable
    }

    return NextResponse.json({
      success: true,
      profile: updated,
      mlInsights,
      message: "Profile updated. Your dashboard has been refreshed with new insights.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 });
  }
}
