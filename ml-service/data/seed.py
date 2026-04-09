"""
Seed data generator for ML model training.
Generates realistic synthetic mood, sleep, and session data for 90 days.
"""
import random
import numpy as np
from datetime import datetime, timedelta


MOODS = ["Radiant", "Calm", "Okay", "Tired", "Anxious", "Stressed"]
MOOD_SCORES = {"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10}
SESSION_TYPES = ["Meditation", "Breathing", "Sleep", "Journaling", "Yoga"]
EXERCISES = [
    {"id": "deep-presence", "title": "Deep Presence Meditation", "type": "Meditation", "duration": 1200},
    {"id": "box-breathing", "title": "Box Breathing", "type": "Breathing", "duration": 300},
    {"id": "body-scan", "title": "Body Scan Relaxation", "type": "Meditation", "duration": 900},
    {"id": "sleep-story", "title": "Sleep Story: Ocean Drift", "type": "Sleep", "duration": 1800},
    {"id": "gratitude-journal", "title": "Gratitude Journal", "type": "Journaling", "duration": 600},
    {"id": "morning-yoga", "title": "Morning Yoga Flow", "type": "Yoga", "duration": 900},
    {"id": "4-7-8-breathing", "title": "4-7-8 Breathing Technique", "type": "Breathing", "duration": 240},
    {"id": "evening-unwind", "title": "Evening Unwind Ritual", "type": "Meditation", "duration": 720},
    {"id": "progressive-relaxation", "title": "Progressive Muscle Relaxation", "type": "Meditation", "duration": 600},
    {"id": "rain-sounds", "title": "Rain Sounds Immersion", "type": "Sleep", "duration": 2700},
]


def generate_user_data(user_id: str = "user_001", days: int = 90) -> dict:
    """Generate synthetic user data for training ML models."""
    moods = []
    sessions = []
    sleep_logs = []
    now = datetime.now()

    # Create realistic patterns: user generally improves over time with some variance
    base_wellness = 40  # starts moderate
    for day_offset in range(days, 0, -1):
        date = now - timedelta(days=day_offset)
        day_of_week = date.weekday()  # 0=Mon, 6=Sun

        # Wellness improves gradually with noise
        progress = (days - day_offset) / days
        wellness = base_wellness + (progress * 35) + random.gauss(0, 10)
        wellness = max(5, min(100, wellness))

        # Mood correlates with wellness
        if wellness > 80:
            mood_choices = ["Radiant", "Calm"]
        elif wellness > 60:
            mood_choices = ["Calm", "Okay", "Radiant"]
        elif wellness > 40:
            mood_choices = ["Okay", "Tired", "Calm"]
        else:
            mood_choices = ["Tired", "Anxious", "Stressed"]

        # Weekend vs weekday patterns
        if day_of_week >= 5:  # Weekend
            mood_choices = [m for m in mood_choices if m != "Stressed"] or ["Calm"]

        selected_mood = random.choice(mood_choices)
        moods.append({
            "user_id": user_id,
            "mood": selected_mood,
            "score": MOOD_SCORES[selected_mood],
            "timestamp": date.isoformat(),
            "day_of_week": day_of_week,
            "hour": random.choice([8, 9, 10, 12, 18, 20, 22]),
        })

        # Sleep: 5-9 hours, better as wellness improves
        sleep_hours = 5.5 + (wellness / 100) * 3.5 + random.gauss(0, 0.5)
        sleep_hours = round(max(3.0, min(10.0, sleep_hours)), 1)
        sleep_quality = round(max(1, min(10, (sleep_hours - 3) / 0.7 + random.gauss(0, 0.8))), 1)
        sleep_logs.append({
            "user_id": user_id,
            "date": date.strftime("%Y-%m-%d"),
            "hours": sleep_hours,
            "quality": sleep_quality,
            "timestamp": date.isoformat(),
        })

        # Sessions: 0-3 per day, more as user engages more
        num_sessions = random.choices([0, 1, 2, 3], weights=[
            max(5, 30 - progress * 25),
            40,
            20 + progress * 10,
            5 + progress * 10,
        ])[0]

        for _ in range(num_sessions):
            exercise = random.choice(EXERCISES)
            actual_duration = exercise["duration"] + random.randint(-60, 120)
            completed = random.random() < (0.6 + progress * 0.3)
            sessions.append({
                "user_id": user_id,
                "exercise_id": exercise["id"],
                "title": exercise["title"],
                "type": exercise["type"],
                "duration": max(60, actual_duration),
                "completed": completed,
                "timestamp": date.isoformat(),
                "day_of_week": day_of_week,
            })

    return {
        "user_id": user_id,
        "moods": moods,
        "sessions": sessions,
        "sleep_logs": sleep_logs,
    }


def generate_training_dataset(num_users: int = 50) -> list:
    """Generate data for multiple synthetic users for collaborative filtering."""
    all_data = []
    for i in range(num_users):
        user_id = f"user_{i:03d}"
        data = generate_user_data(user_id, days=random.randint(30, 120))
        all_data.append(data)
    return all_data
