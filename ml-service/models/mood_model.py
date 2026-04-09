"""
Mood Prediction Model
- Uses Random Forest Classifier to predict next-day mood
- Features: rolling mood averages, day of week, sleep, session activity
- Also provides mood trend curves via linear regression
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import warnings

warnings.filterwarnings("ignore")

MOOD_LABELS = ["Radiant", "Calm", "Okay", "Tired", "Anxious", "Stressed"]
MOOD_SCORES = {"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10}


class MoodPredictor:
    def __init__(self):
        self.classifier = RandomForestClassifier(
            n_estimators=100, max_depth=8, random_state=42, class_weight="balanced"
        )
        self.trend_model = GradientBoostingRegressor(
            n_estimators=80, max_depth=4, learning_rate=0.1, random_state=42
        )
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(MOOD_LABELS)
        self.is_trained = False
        self.accuracy = 0.0

    def _build_features(self, moods: list, sleep_logs: list = None, sessions: list = None) -> pd.DataFrame:
        """Engineer features from raw mood/sleep/session data."""
        if not moods or len(moods) < 3:
            return pd.DataFrame()

        df = pd.DataFrame(moods)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

        # Rolling averages
        df["score_rolling_3"] = df["score"].rolling(3, min_periods=1).mean()
        df["score_rolling_7"] = df["score"].rolling(7, min_periods=1).mean()
        df["score_rolling_14"] = df["score"].rolling(14, min_periods=1).mean()

        # Score change
        df["score_diff_1"] = df["score"].diff(1).fillna(0)
        df["score_diff_3"] = df["score"].diff(3).fillna(0)

        # Variance
        df["score_std_7"] = df["score"].rolling(7, min_periods=1).std().fillna(0)

        # Day and time features
        if "day_of_week" not in df.columns:
            df["day_of_week"] = df["timestamp"].dt.dayofweek
        if "hour" not in df.columns:
            df["hour"] = df["timestamp"].dt.hour

        df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
        df["is_morning"] = (df["hour"] < 12).astype(int)

        # Streak: consecutive days with score > 50
        df["above_avg"] = (df["score"] > 50).astype(int)

        # Sleep features (if available)
        if sleep_logs and len(sleep_logs) > 0:
            sleep_df = pd.DataFrame(sleep_logs)
            sleep_df["timestamp"] = pd.to_datetime(sleep_df["timestamp"])
            sleep_df = sleep_df.sort_values("timestamp")
            if "hours" in sleep_df.columns:
                df["sleep_hours"] = sleep_df["hours"].values[:len(df)] if len(sleep_df) >= len(df) else \
                    list(sleep_df["hours"].values) + [7.0] * (len(df) - len(sleep_df))
                df["sleep_hours"] = df["sleep_hours"].astype(float)
            else:
                df["sleep_hours"] = 7.0
        else:
            df["sleep_hours"] = 7.0

        # Session count features (if available)
        if sessions and len(sessions) > 0:
            sess_df = pd.DataFrame(sessions)
            sess_df["timestamp"] = pd.to_datetime(sess_df["timestamp"])
            sess_df["date"] = sess_df["timestamp"].dt.date
            daily_sessions = sess_df.groupby("date").agg(
                session_count=("type", "count"),
                total_duration=("duration", "sum"),
            ).reset_index()
            df["date"] = df["timestamp"].dt.date
            df = df.merge(daily_sessions, on="date", how="left")
            df["session_count"] = df["session_count"].fillna(0)
            df["total_duration"] = df["total_duration"].fillna(0)
        else:
            df["session_count"] = 0
            df["total_duration"] = 0

        feature_cols = [
            "score_rolling_3", "score_rolling_7", "score_rolling_14",
            "score_diff_1", "score_diff_3", "score_std_7",
            "day_of_week", "is_weekend", "is_morning",
            "sleep_hours", "session_count", "total_duration",
        ]
        existing_cols = [c for c in feature_cols if c in df.columns]
        return df[existing_cols + ["score", "mood"]]

    def train(self, all_users_data: list):
        """Train on data from multiple users."""
        all_features = []
        for user_data in all_users_data:
            features = self._build_features(
                user_data.get("moods", []),
                user_data.get("sleep_logs", []),
                user_data.get("sessions", []),
            )
            if len(features) > 5:
                all_features.append(features)

        if not all_features:
            print("[MoodPredictor] No valid training data")
            return

        combined = pd.concat(all_features, ignore_index=True)
        feature_cols = [c for c in combined.columns if c not in ["mood", "score"]]

        X = combined[feature_cols].fillna(0).values
        y_class = self.label_encoder.transform(combined["mood"].values)
        y_score = combined["score"].values

        # Train classifier
        X_train, X_test, y_train, y_test = train_test_split(X, y_class, test_size=0.2, random_state=42)
        self.classifier.fit(X_train, y_train)
        y_pred = self.classifier.predict(X_test)
        self.accuracy = round(accuracy_score(y_test, y_pred), 3)

        # Train trend regressor
        X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X, y_score, test_size=0.2, random_state=42)
        self.trend_model.fit(X_train_r, y_train_r)

        self.is_trained = True
        self.feature_cols = feature_cols
        print(f"[MoodPredictor] Trained. Accuracy: {self.accuracy}")

    def predict_next_mood(self, moods: list, sleep_logs: list = None, sessions: list = None) -> dict:
        """Predict the next day's mood and score."""
        if not self.is_trained:
            return self._fallback_prediction(moods)

        features = self._build_features(moods, sleep_logs, sessions)
        if features.empty:
            return self._fallback_prediction(moods)

        feature_cols = [c for c in features.columns if c not in ["mood", "score"]]
        last_row = features[feature_cols].iloc[-1:].fillna(0).values

        predicted_class = self.classifier.predict(last_row)[0]
        predicted_mood = self.label_encoder.inverse_transform([predicted_class])[0]
        predicted_score = float(self.trend_model.predict(last_row)[0])
        predicted_score = max(5, min(100, round(predicted_score, 1)))

        probabilities = self.classifier.predict_proba(last_row)[0]
        mood_probs = {
            self.label_encoder.inverse_transform([i])[0]: round(float(p), 3)
            for i, p in enumerate(probabilities)
            if p > 0.05
        }

        return {
            "predicted_mood": predicted_mood,
            "predicted_score": predicted_score,
            "confidence": round(float(max(probabilities)), 3),
            "probabilities": mood_probs,
            "model_accuracy": self.accuracy,
        }

    def predict_trend(self, moods: list, sleep_logs: list = None, sessions: list = None, days_ahead: int = 7) -> list:
        """Predict mood scores for the next N days."""
        if not self.is_trained or len(moods) < 3:
            return self._fallback_trend(moods, days_ahead)

        features = self._build_features(moods, sleep_logs, sessions)
        if features.empty:
            return self._fallback_trend(moods, days_ahead)

        feature_cols = [c for c in features.columns if c not in ["mood", "score"]]
        trend = []
        last_features = features[feature_cols].iloc[-1:].fillna(0).values.copy()

        for i in range(days_ahead):
            score = float(self.trend_model.predict(last_features)[0])
            score = max(5, min(100, round(score, 1)))
            day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            day_idx = (int(last_features[0][6]) + i + 1) % 7 if last_features.shape[1] > 6 else i % 7
            trend.append({
                "day": day_names[day_idx],
                "predicted_score": score,
                "day_index": i + 1,
            })
            # Slight random walk for next prediction
            if last_features.shape[1] > 0:
                last_features[0][0] = score  # update rolling average

        return trend

    def _fallback_prediction(self, moods: list) -> dict:
        """Rule-based fallback when model isn't trained."""
        if not moods:
            return {"predicted_mood": "Calm", "predicted_score": 60, "confidence": 0.5, "probabilities": {}, "model_accuracy": 0}
        recent = moods[-min(5, len(moods)):]
        avg_score = sum(MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in recent) / len(recent)
        for mood, score in sorted(MOOD_SCORES.items(), key=lambda x: abs(x[1] - avg_score)):
            return {"predicted_mood": mood, "predicted_score": round(avg_score, 1), "confidence": 0.4, "probabilities": {}, "model_accuracy": 0}

    def _fallback_trend(self, moods: list, days: int) -> list:
        """Simple moving average fallback."""
        if not moods:
            return [{"day": d, "predicted_score": 60, "day_index": i + 1} for i, d in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][:days])]
        recent_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods[-7:]]
        avg = sum(recent_scores) / len(recent_scores)
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return [{"day": day_names[i % 7], "predicted_score": round(avg + np.random.normal(0, 5), 1), "day_index": i + 1} for i in range(days)]
