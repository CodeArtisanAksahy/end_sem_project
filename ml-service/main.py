"""
ML Mental Wellness Service — FastAPI Application
Trains all models on startup, serves predictions via REST.
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from models.mood_model import MoodPredictor
from models.stress_model import StressScorer
from models.insight_engine import InsightEngine
from models.recommender import Recommender
from data.seed import generate_training_dataset


# =================== GLOBAL MODEL INSTANCES ===================
mood_predictor = MoodPredictor()
stress_scorer = StressScorer()
insight_engine = InsightEngine()
recommender = Recommender()
training_stats = {"training_time": 0, "training_samples": 0, "trained_at": ""}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train all models on startup."""
    print("\n" + "=" * 60)
    print("  ML Wellness Service — Training Models...")
    print("=" * 60 + "\n")
    start = time.time()

    # Generate synthetic training data
    training_data = generate_training_dataset(num_users=50)
    total_moods = sum(len(u["moods"]) for u in training_data)
    total_sessions = sum(len(u["sessions"]) for u in training_data)
    print(f"Generated {len(training_data)} users, {total_moods} mood entries, {total_sessions} sessions\n")

    # Train each model
    mood_predictor.train(training_data)
    stress_scorer.train(training_data)
    recommender.train(training_data)

    elapsed = round(time.time() - start, 2)
    training_stats["training_time"] = elapsed
    training_stats["training_samples"] = total_moods
    training_stats["trained_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'=' * 60}")
    print(f"  All models trained in {elapsed}s")
    print(f"  Service ready on http://localhost:8000")
    print(f"{'=' * 60}\n")

    yield
    print("ML Service shutting down")


# =================== APP SETUP ===================
app = FastAPI(
    title="Mental Wellness ML Service",
    description="ML-powered predictions for mood, stress, insights, and recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =================== REQUEST MODELS ===================
class MoodEntry(BaseModel):
    mood: str
    score: int = 50
    timestamp: str = ""
    day_of_week: int = 0
    hour: int = 12

class SleepEntry(BaseModel):
    date: str = ""
    hours: float = 7.0
    quality: float = 7.0
    timestamp: str = ""

class SessionEntry(BaseModel):
    exercise_id: str = ""
    title: str = ""
    type: str = "Meditation"
    duration: int = 600
    completed: bool = True
    timestamp: str = ""
    day_of_week: int = 0

class PredictMoodRequest(BaseModel):
    moods: List[Dict[str, Any]]
    sleep_logs: Optional[List[Dict[str, Any]]] = []
    sessions: Optional[List[Dict[str, Any]]] = []
    days_ahead: int = 7

class PredictStressRequest(BaseModel):
    moods: List[Dict[str, Any]]
    sleep_logs: Optional[List[Dict[str, Any]]] = []
    sessions: Optional[List[Dict[str, Any]]] = []

class InsightRequest(BaseModel):
    moods: List[Dict[str, Any]]
    sleep_logs: Optional[List[Dict[str, Any]]] = []
    sessions: Optional[List[Dict[str, Any]]] = []
    max_insights: int = 4

class RecommendRequest(BaseModel):
    moods: List[Dict[str, Any]]
    sessions: Optional[List[Dict[str, Any]]] = []
    sleep_logs: Optional[List[Dict[str, Any]]] = []
    current_mood: Optional[str] = None
    time_of_day: Optional[str] = None
    limit: int = 5

class FullDashboardRequest(BaseModel):
    moods: List[Dict[str, Any]]
    sleep_logs: Optional[List[Dict[str, Any]]] = []
    sessions: Optional[List[Dict[str, Any]]] = []
    current_mood: Optional[str] = None


# =================== ENDPOINTS ===================

@app.get("/")
async def root():
    return {
        "service": "Mental Wellness ML API",
        "version": "1.0.0",
        "models": {
            "mood_predictor": {"trained": mood_predictor.is_trained, "accuracy": mood_predictor.accuracy},
            "stress_scorer": {"trained": stress_scorer.is_trained},
            "recommender": {"trained": recommender.is_trained},
            "insight_engine": {"type": "rule-based + statistical"},
        },
        "training_stats": training_stats,
        "endpoints": ["/predict/mood", "/predict/stress", "/generate/insight", "/recommend", "/dashboard"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "models_ready": mood_predictor.is_trained}


@app.post("/predict/mood")
async def predict_mood(request: PredictMoodRequest):
    """Predict next-day mood and multi-day trend."""
    if not request.moods:
        raise HTTPException(status_code=400, detail="At least 1 mood entry required")

    prediction = mood_predictor.predict_next_mood(
        request.moods, request.sleep_logs, request.sessions
    )
    trend = mood_predictor.predict_trend(
        request.moods, request.sleep_logs, request.sessions, request.days_ahead
    )

    return {
        "prediction": prediction,
        "trend": trend,
        "data_points": len(request.moods),
    }


@app.post("/predict/stress")
async def predict_stress(request: PredictStressRequest):
    """Calculate stress index, wellness score, and resilience."""
    if not request.moods:
        raise HTTPException(status_code=400, detail="At least 1 mood entry required")

    result = stress_scorer.predict(
        request.moods, request.sleep_logs, request.sessions
    )
    return result


@app.post("/generate/insight")
async def generate_insight(request: InsightRequest):
    """Generate ML-driven personalized insights."""
    if not request.moods:
        raise HTTPException(status_code=400, detail="At least 1 mood entry required")

    result = insight_engine.generate(
        request.moods, request.sleep_logs, request.sessions, request.max_insights
    )
    return result


@app.post("/recommend")
async def recommend(request: RecommendRequest):
    """Get personalized exercise recommendations."""
    result = recommender.recommend(
        request.moods, request.sessions, request.sleep_logs,
        request.current_mood, request.time_of_day, request.limit
    )
    return result


@app.post("/dashboard")
async def full_dashboard(request: FullDashboardRequest):
    """Single endpoint that returns ALL ML predictions for the dashboard."""
    moods = request.moods
    sleep_logs = request.sleep_logs or []
    sessions = request.sessions or []

    # Run all models
    mood_prediction = mood_predictor.predict_next_mood(moods, sleep_logs, sessions)
    mood_trend = mood_predictor.predict_trend(moods, sleep_logs, sessions, 7)
    stress = stress_scorer.predict(moods, sleep_logs, sessions)
    insights = insight_engine.generate(moods, sleep_logs, sessions, 4)
    recommendations = recommender.recommend(
        moods, sessions, sleep_logs, request.current_mood, limit=5
    )

    return {
        "mood": {
            "prediction": mood_prediction,
            "trend": mood_trend,
        },
        "wellness": {
            "stress_index": stress["stress_index"],
            "wellness_score": stress["wellness_score"],
            "resilience_score": stress["resilience_score"],
            "burnout_risk": stress["burnout_risk"],
            "percentile": stress["percentile"],
            "breakdown": stress["breakdown"],
        },
        "insights": insights["insights"],
        "badges": insights["badges"],
        "recommendations": recommendations,
        "meta": {
            "models_trained": mood_predictor.is_trained,
            "data_points_analyzed": len(moods) + len(sleep_logs) + len(sessions),
            "patterns_detected": insights["patterns_detected"],
        },
    }


@app.post("/retrain")
async def retrain():
    """Trigger model retraining (would connect to DB in production)."""
    start = time.time()
    training_data = generate_training_dataset(num_users=50)
    mood_predictor.train(training_data)
    stress_scorer.train(training_data)
    recommender.train(training_data)
    elapsed = round(time.time() - start, 2)
    return {"success": True, "message": f"All models retrained in {elapsed}s"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
