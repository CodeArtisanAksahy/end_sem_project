import { NextResponse } from "next/server";
import { addMood, getTodayMood, getMoodHistory } from "../lib/store";
import { connectDB, MoodModel, callMLService, checkMLService } from "../lib/mongodb";

const MOOD_SCORES: Record<string, number> = {
  Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10,
};
const EMOJI_MAP: Record<string, string> = {
  Radiant: "😄", Calm: "😌", Okay: "😐", Tired: "😴", Anxious: "😰", Stressed: "😤",
};

export async function GET() {
  return NextResponse.json({
    todayMood: getTodayMood(),
    history: getMoodHistory(7),
  });
}

export async function POST(request: Request) {
  try {
    const { mood, note } = await request.json();
    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    // Store in in-memory store
    const entry = addMood(mood, note);

    // Also store in MongoDB if available
    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await MoodModel.create({
          userId: "user_001",
          mood,
          score: MOOD_SCORES[mood] || 50,
          emoji: EMOJI_MAP[mood] || "😊",
          note,
          dayOfWeek: new Date().getDay(),
          hour: new Date().getHours(),
        });
      } catch (err) {
        console.log("[Mood API] MongoDB write failed, data kept in memory");
      }
    }

    // Get ML prediction for next mood
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
      mlPrediction = await callMLService("/predict/mood", {
        moods: moodData,
        days_ahead: 3,
      });
    }

    const response: any = {
      success: true,
      message: "Successfully logged your mood as " + mood + ". Thanks for checking in!",
      entry,
      history: getMoodHistory(5),
      db_stored: dbConnected,
    };

    if (mlPrediction) {
      response.ml_prediction = mlPrediction.prediction;
      response.ml_trend = mlPrediction.trend;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to log mood" }, { status: 500 });
  }
}
