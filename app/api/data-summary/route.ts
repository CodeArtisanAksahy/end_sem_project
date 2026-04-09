import { NextResponse } from "next/server";
import { getDataCollectionSummary, getMLFormattedData } from "../lib/store";
import { checkMLService, callMLService } from "../lib/mongodb";

export async function GET() {
  const summary = getDataCollectionSummary();
  const mlAvailable = await checkMLService();

  const response: any = {
    ...summary,
    ml_service_available: mlAvailable,
  };

  // If ML is available and we have enough data, get a full prediction
  if (mlAvailable && summary.ml_ready) {
    const mlData = getMLFormattedData();
    const dashboard = await callMLService("/dashboard", {
      ...mlData,
      current_mood: mlData.moods[0]?.mood || "Calm",
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
}
