"""
Stress & Wellness Score Model
- Combines mood, sleep, and session data into composite scores
- Uses Ridge Regression for stress prediction
- Outputs: Resilience Score (0-10), Stress Index (0-100), Wellness Score
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings("ignore")

MOOD_SCORES = {"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10}


class StressScorer:
    def __init__(self):
        self.stress_model = Ridge(alpha=1.0)
        self.scaler = StandardScaler()
        self.is_trained = False

    def _engineer_features(self, moods: list, sleep_logs: list, sessions: list) -> dict:
        """Compute aggregate features from raw data."""
        now_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods]

        # Mood features
        recent_7 = now_scores[-7:] if len(now_scores) >= 7 else now_scores
        recent_3 = now_scores[-3:] if len(now_scores) >= 3 else now_scores
        mood_avg_7 = np.mean(recent_7) if recent_7 else 50
        mood_avg_3 = np.mean(recent_3) if recent_3 else 50
        mood_std_7 = np.std(recent_7) if len(recent_7) > 1 else 0
        mood_trend = mood_avg_3 - mood_avg_7  # positive = improving

        # Negative mood frequency
        negative_moods = ["Tired", "Anxious", "Stressed"]
        recent_mood_labels = [m.get("mood", "Okay") for m in moods[-7:]]
        neg_ratio = sum(1 for m in recent_mood_labels if m in negative_moods) / max(len(recent_mood_labels), 1)

        # Sleep features
        sleep_hours = [s.get("hours", 7) for s in (sleep_logs or [])[-7:]]
        avg_sleep = np.mean(sleep_hours) if sleep_hours else 7.0
        sleep_deficit = max(0, 7.5 - avg_sleep)
        sleep_consistency = np.std(sleep_hours) if len(sleep_hours) > 1 else 0

        # Session/activity features
        recent_sessions = (sessions or [])[-14:]
        completed_sessions = [s for s in recent_sessions if s.get("completed", True)]
        session_count_7d = len([s for s in recent_sessions[-7:]])
        total_minutes_7d = sum(s.get("duration", 0) for s in recent_sessions[-7:]) / 60

        # Streak calculation
        streak = 0
        for m in reversed(moods):
            score = MOOD_SCORES.get(m.get("mood", "Okay"), 50)
            if score >= 50:
                streak += 1
            else:
                break

        return {
            "mood_avg_7": mood_avg_7,
            "mood_avg_3": mood_avg_3,
            "mood_std_7": mood_std_7,
            "mood_trend": mood_trend,
            "neg_ratio": neg_ratio,
            "avg_sleep": avg_sleep,
            "sleep_deficit": sleep_deficit,
            "sleep_consistency": sleep_consistency,
            "session_count_7d": session_count_7d,
            "total_minutes_7d": total_minutes_7d,
            "completed_sessions": len(completed_sessions),
            "streak": streak,
        }

    def train(self, all_users_data: list):
        """Train stress model using synthetic ground truth."""
        X_all, y_all = [], []

        for user_data in all_users_data:
            moods = user_data.get("moods", [])
            sleep = user_data.get("sleep_logs", [])
            sessions = user_data.get("sessions", [])

            if len(moods) < 7:
                continue

            # Use sliding windows of 7 days
            for i in range(7, len(moods), 3):
                window_moods = moods[:i]
                window_sleep = sleep[:i] if sleep else []
                window_sessions = [s for s in sessions if s.get("timestamp", "") <= moods[i - 1].get("timestamp", "")]

                features = self._engineer_features(window_moods, window_sleep, window_sessions)
                X_all.append(list(features.values()))

                # Synthetic stress score (inverse of wellness)
                stress = 100 - features["mood_avg_7"] + features["sleep_deficit"] * 8 + features["neg_ratio"] * 20
                stress = max(0, min(100, stress + np.random.normal(0, 5)))
                y_all.append(stress)

        if not X_all:
            print("[StressScorer] No valid training data")
            return

        X = np.array(X_all)
        y = np.array(y_all)

        X_scaled = self.scaler.fit_transform(X)
        self.stress_model.fit(X_scaled, y)
        self.is_trained = True
        print(f"[StressScorer] Trained on {len(X)} samples. R2: {round(self.stress_model.score(X_scaled, y), 3)}")

    def predict(self, moods: list, sleep_logs: list = None, sessions: list = None) -> dict:
        """Generate comprehensive stress and wellness scores."""
        features = self._engineer_features(moods, sleep_logs or [], sessions or [])

        # Compute stress index
        if self.is_trained:
            X = np.array([list(features.values())])
            X_scaled = self.scaler.transform(X)
            stress_index = float(self.stress_model.predict(X_scaled)[0])
        else:
            # Fallback formula
            stress_index = 100 - features["mood_avg_7"] + features["sleep_deficit"] * 8 + features["neg_ratio"] * 20

        stress_index = round(max(0, min(100, stress_index)), 1)

        # Wellness Score (0-100) — inverse of stress, boosted by activity
        activity_bonus = min(15, features["session_count_7d"] * 2)
        wellness_score = round(max(0, min(100, 100 - stress_index + activity_bonus)), 1)

        # Resilience Score (0-10) — composite of recovery + consistency
        recovery_factor = max(0, features["mood_trend"]) / 10  # how much mood is improving
        consistency_factor = features["streak"] / 14  # streak as fraction of 2 weeks
        activity_factor = min(1, features["session_count_7d"] / 7)  # daily activity target
        sleep_factor = min(1, features["avg_sleep"] / 8)  # sleep adequacy

        resilience = (
            recovery_factor * 2.5 +
            consistency_factor * 2.5 +
            activity_factor * 2.5 +
            sleep_factor * 2.5
        )
        resilience = round(max(0, min(10, resilience)), 1)

        # Burnout risk detection
        burnout_risk = "low"
        if stress_index > 70 and features["neg_ratio"] > 0.6:
            burnout_risk = "high"
        elif stress_index > 50 and features["neg_ratio"] > 0.4:
            burnout_risk = "moderate"

        # Percentile estimation (simplified)
        percentile = round(min(99, max(1, wellness_score * 0.95 + features["streak"] * 0.5)), 0)

        return {
            "stress_index": stress_index,
            "wellness_score": wellness_score,
            "resilience_score": resilience,
            "burnout_risk": burnout_risk,
            "percentile": int(percentile),
            "breakdown": {
                "mood_stability": round(100 - features["mood_std_7"], 1),
                "sleep_quality": round(min(100, features["avg_sleep"] / 8 * 100), 1),
                "activity_level": round(min(100, features["session_count_7d"] / 7 * 100), 1),
                "consistency": round(min(100, features["streak"] / 14 * 100), 1),
                "improvement_trend": round(features["mood_trend"], 1),
            },
            "features_used": features,
            "model_trained": self.is_trained,
        }
