import { NextResponse } from "next/server";
import { addSleepLog, getSleepLogs, getTodaySleep, getMLFormattedData } from "../lib/store";
import { connectDB, SleepLogModel, callMLService, checkMLService } from "../lib/mongodb";

export async function GET() {
  const todaySleep = getTodaySleep();
  const history = getSleepLogs(14);
  return NextResponse.json({ todaySleep, history });
}

export async function POST(request: Request) {
  try {
    const { hours, quality, notes } = await request.json();

    if (!hours || hours < 0 || hours > 24) {
      return NextResponse.json({ error: "Valid sleep hours (0-24) required" }, { status: 400 });
    }

    const qualityScore = quality || Math.round(Math.min(10, Math.max(1, (hours - 3) / 0.7)));

    // Store in memory
    const entry = addSleepLog(hours, qualityScore, notes);

    // Also store in MongoDB if available
    const dbConnected = await connectDB();
    if (dbConnected) {
      try {
        await SleepLogModel.findOneAndUpdate(
          { userId: "user_001", date: entry.date },
          {
            userId: "user_001",
            hours,
            quality: qualityScore,
            date: entry.date,
            timestamp: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.log("[Sleep API] MongoDB write failed, data kept in memory");
      }
    }

    // Get updated ML stress prediction with new sleep data
    let mlUpdate = null;
    const mlAvailable = await checkMLService();
    if (mlAvailable) {
      const mlData = getMLFormattedData();
      mlUpdate = await callMLService("/predict/stress", mlData);
    }

    const response: any = {
      success: true,
      message: `Logged ${hours} hours of sleep${qualityScore >= 7 ? " — great rest!" : qualityScore >= 5 ? "." : " — aim for more rest tonight."}`,
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
  } catch {
    return NextResponse.json({ error: "Failed to log sleep" }, { status: 500 });
  }
}
