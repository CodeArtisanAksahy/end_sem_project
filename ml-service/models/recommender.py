"""
Recommendation Engine
- Content-based filtering using user's personal patterns
- Collaborative filtering approximation using cluster similarity
- Contextual recommendations based on time-of-day and recent mood
"""
import numpy as np
from collections import Counter
from typing import List, Dict
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings("ignore")

MOOD_SCORES = {"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10}

# Full exercise catalog with metadata
EXERCISE_CATALOG = [
    {"id": "deep-presence", "title": "Deep Presence Meditation", "type": "Meditation", "duration": 1200, "difficulty": "intermediate", "tags": ["focus", "mindfulness", "calm"], "best_for": ["Okay", "Calm"]},
    {"id": "box-breathing", "title": "Box Breathing (4-4-4-4)", "type": "Breathing", "duration": 300, "difficulty": "beginner", "tags": ["stress", "quick", "anxiety"], "best_for": ["Anxious", "Stressed"]},
    {"id": "body-scan", "title": "Body Scan Relaxation", "type": "Meditation", "duration": 900, "difficulty": "beginner", "tags": ["relaxation", "body", "tension"], "best_for": ["Tired", "Stressed"]},
    {"id": "sleep-story", "title": "Ocean Drift Sleep Story", "type": "Sleep", "duration": 1800, "difficulty": "beginner", "tags": ["sleep", "relaxation", "night"], "best_for": ["Tired"]},
    {"id": "gratitude-journal", "title": "Gratitude Journal Prompt", "type": "Journaling", "duration": 600, "difficulty": "beginner", "tags": ["positivity", "reflection", "gratitude"], "best_for": ["Okay", "Calm"]},
    {"id": "morning-yoga", "title": "Sunrise Yoga Flow", "type": "Yoga", "duration": 900, "difficulty": "intermediate", "tags": ["energy", "morning", "body"], "best_for": ["Tired", "Okay"]},
    {"id": "4-7-8-breathing", "title": "4-7-8 Calming Breath", "type": "Breathing", "duration": 240, "difficulty": "beginner", "tags": ["instant", "calm", "anxiety"], "best_for": ["Anxious", "Stressed"]},
    {"id": "evening-unwind", "title": "Evening Unwind Ritual", "type": "Meditation", "duration": 720, "difficulty": "beginner", "tags": ["evening", "transition", "calm"], "best_for": ["Okay", "Tired"]},
    {"id": "progressive-relaxation", "title": "Progressive Muscle Relaxation", "type": "Meditation", "duration": 600, "difficulty": "beginner", "tags": ["tension", "physical", "stress"], "best_for": ["Stressed", "Anxious"]},
    {"id": "rain-sounds", "title": "Rain Sounds Immersion", "type": "Sleep", "duration": 2700, "difficulty": "beginner", "tags": ["sleep", "ambient", "relaxation"], "best_for": ["Tired"]},
    {"id": "focus-sprint", "title": "10-Min Focus Sprint", "type": "Meditation", "duration": 600, "difficulty": "intermediate", "tags": ["focus", "productivity", "clarity"], "best_for": ["Okay", "Calm"]},
    {"id": "self-compassion", "title": "Self-Compassion Meditation", "type": "Meditation", "duration": 900, "difficulty": "intermediate", "tags": ["self-care", "kindness", "emotional"], "best_for": ["Anxious", "Stressed", "Tired"]},
    {"id": "walking-meditation", "title": "Walking Meditation Guide", "type": "Yoga", "duration": 600, "difficulty": "beginner", "tags": ["movement", "outdoor", "mindfulness"], "best_for": ["Okay", "Calm"]},
    {"id": "anxiety-release", "title": "Anxiety Release Breathwork", "type": "Breathing", "duration": 480, "difficulty": "intermediate", "tags": ["anxiety", "release", "emotional"], "best_for": ["Anxious", "Stressed"]},
    {"id": "deep-sleep", "title": "Deep Sleep Hypnosis", "type": "Sleep", "duration": 2400, "difficulty": "beginner", "tags": ["deep-sleep", "hypnosis", "night"], "best_for": ["Tired"]},
]


class Recommender:
    def __init__(self):
        self.kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        self.scaler = StandardScaler()
        self.user_clusters = {}
        self.cluster_preferences = {}
        self.is_trained = False

    def _build_user_profile(self, moods: list, sessions: list) -> np.ndarray:
        """Build a feature vector representing a user's profile."""
        scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods]
        avg_mood = np.mean(scores) if scores else 50
        mood_volatility = np.std(scores) if len(scores) > 1 else 0

        # Session preferences
        type_counts = Counter(s.get("type", "Other") for s in sessions)
        total = max(sum(type_counts.values()), 1)
        meditation_pref = type_counts.get("Meditation", 0) / total
        breathing_pref = type_counts.get("Breathing", 0) / total
        sleep_pref = type_counts.get("Sleep", 0) / total

        # Activity level
        sessions_per_week = len(sessions) / max(len(moods) / 7, 1) if moods else 0
        avg_duration = np.mean([s.get("duration", 600) for s in sessions]) / 60 if sessions else 10

        return np.array([avg_mood, mood_volatility, meditation_pref, breathing_pref, sleep_pref, sessions_per_week, avg_duration])

    def train(self, all_users_data: list):
        """Train collaborative filtering model on multi-user data."""
        profiles = []
        user_ids = []

        for user_data in all_users_data:
            moods = user_data.get("moods", [])
            sessions = user_data.get("sessions", [])
            if len(moods) < 5:
                continue
            profile = self._build_user_profile(moods, sessions)
            profiles.append(profile)
            user_ids.append(user_data.get("user_id", "unknown"))

        if len(profiles) < 5:
            print("[Recommender] Not enough users for clustering")
            return

        X = np.array(profiles)
        X_scaled = self.scaler.fit_transform(X)
        labels = self.kmeans.fit_predict(X_scaled)

        # Build cluster preferences
        for i, label in enumerate(labels):
            self.user_clusters[user_ids[i]] = int(label)
            if label not in self.cluster_preferences:
                self.cluster_preferences[label] = []
            user_sessions = all_users_data[i].get("sessions", [])
            for s in user_sessions:
                if s.get("completed", True):
                    self.cluster_preferences[label].append(s.get("type", "Meditation"))

        self.is_trained = True
        print(f"[Recommender] Trained with {len(profiles)} users in {len(set(labels))} clusters")

    def recommend(self, moods: list, sessions: list = None, sleep_logs: list = None,
                  current_mood: str = None, time_of_day: str = None, limit: int = 5) -> dict:
        """Generate personalized recommendations."""
        sessions = sessions or []
        recent_mood = current_mood or (moods[-1].get("mood", "Okay") if moods else "Okay")
        recent_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods[-7:]]
        avg_recent = np.mean(recent_scores) if recent_scores else 50

        # Determine time context
        if not time_of_day:
            from datetime import datetime
            hour = datetime.now().hour
            if hour < 6:
                time_of_day = "night"
            elif hour < 12:
                time_of_day = "morning"
            elif hour < 17:
                time_of_day = "afternoon"
            elif hour < 21:
                time_of_day = "evening"
            else:
                time_of_day = "night"

        # Score each exercise
        scored_exercises = []
        completed_ids = set(s.get("exercise_id", "") for s in sessions[-14:])

        for ex in EXERCISE_CATALOG:
            score = 0.0

            # Mood relevance
            if recent_mood in ex.get("best_for", []):
                score += 30

            # Stress state boosting
            if avg_recent < 40:
                if "stress" in ex["tags"] or "anxiety" in ex["tags"] or "quick" in ex["tags"]:
                    score += 20
            elif avg_recent > 70:
                if "focus" in ex["tags"] or "gratitude" in ex["tags"]:
                    score += 15

            # Time-of-day relevance
            if time_of_day == "morning" and "morning" in ex["tags"]:
                score += 15
            elif time_of_day == "evening" and ("evening" in ex["tags"] or "relaxation" in ex["tags"]):
                score += 15
            elif time_of_day == "night" and ("sleep" in ex["tags"] or "night" in ex["tags"]):
                score += 25

            # Novelty bonus: haven't done recently
            if ex["id"] not in completed_ids:
                score += 10

            # Duration preference: if stressed, prefer shorter
            if avg_recent < 40 and ex["duration"] <= 480:
                score += 10

            # Collaborative filtering bonus
            if self.is_trained:
                profile = self._build_user_profile(moods, sessions)
                try:
                    profile_scaled = self.scaler.transform(profile.reshape(1, -1))
                    cluster = self.kmeans.predict(profile_scaled)[0]
                    cluster_prefs = Counter(self.cluster_preferences.get(int(cluster), []))
                    if cluster_prefs and ex["type"] in cluster_prefs:
                        score += cluster_prefs[ex["type"]] * 0.5
                except Exception:
                    pass

            scored_exercises.append({**ex, "relevance_score": round(score, 1)})

        # Sort by relevance
        scored_exercises.sort(key=lambda x: x["relevance_score"], reverse=True)
        top = scored_exercises[:limit]

        # Categorized recommendations
        primary = top[0] if top else None
        alternatives = top[1:3] if len(top) > 1 else []

        # Generate reason text
        reasons = []
        if MOOD_SCORES.get(recent_mood, 50) < 40:
            reasons.append(f"Based on your current {recent_mood} state, calming exercises are prioritized.")
        if time_of_day == "night":
            reasons.append("It's late — sleep-focused content is recommended.")
        elif time_of_day == "morning":
            reasons.append("Morning sessions set the tone for your day.")
        if self.is_trained:
            reasons.append("Recommendations refined using patterns from similar users.")

        return {
            "primary_recommendation": {
                "id": primary["id"],
                "title": primary["title"],
                "type": primary["type"],
                "duration_minutes": round(primary["duration"] / 60),
                "relevance_score": primary["relevance_score"],
                "reason": f"Highly relevant for your {recent_mood} state" + (f" at this {time_of_day} hour" if time_of_day else ""),
            } if primary else None,
            "alternatives": [{
                "id": a["id"],
                "title": a["title"],
                "type": a["type"],
                "duration_minutes": round(a["duration"] / 60),
                "relevance_score": a["relevance_score"],
            } for a in alternatives],
            "all_ranked": [{
                "id": e["id"],
                "title": e["title"],
                "type": e["type"],
                "duration_minutes": round(e["duration"] / 60),
                "difficulty": e["difficulty"],
                "tags": e["tags"],
                "relevance_score": e["relevance_score"],
            } for e in top],
            "context": {
                "current_mood": recent_mood,
                "avg_recent_score": round(avg_recent, 1),
                "time_of_day": time_of_day,
                "model_trained": self.is_trained,
            },
            "reasoning": reasons,
        }
