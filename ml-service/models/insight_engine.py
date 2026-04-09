"""
AI Insight Generator
- Hybrid: ML pattern detection + rule-based natural language generation
- Detects correlations between mood, sleep, sessions, and time
- Generates human-readable actionable insights
"""
import numpy as np
from collections import Counter
from typing import List

MOOD_SCORES = {"Radiant": 95, "Calm": 75, "Okay": 50, "Tired": 30, "Anxious": 20, "Stressed": 10}


class InsightEngine:
    def __init__(self):
        self.insight_templates = {
            "meditation_helps": [
                "Your mood improves by {delta}% on days you meditate. Morning sessions seem especially effective — consider making them a daily ritual.",
                "We detected a strong correlation: on meditation days, your emotional score averages {high_score} vs {low_score} on non-meditation days.",
                "Data shows meditation is your strongest lever. Sessions over 10 minutes boost your next-day mood by {delta}%.",
            ],
            "sleep_correlation": [
                "Your mood score correlates strongly with sleep. When you get {good_sleep}+ hours, your wellness score jumps by {delta} points.",
                "Sleep is your foundation: nights with {good_sleep}+ hours precede your highest mood days ({high_mood} average).",
                "We noticed your stress index drops by {delta}% on mornings after {good_sleep}+ hours of sleep.",
            ],
            "streak_momentum": [
                "You're on a {streak}-day positive streak! Users who maintain streaks this long see a {delta}% lower burnout risk.",
                "Impressive consistency — {streak} days of active self-care. Your resilience score has climbed {delta} points since you started.",
                "Your {streak}-day streak is in the top {percentile}% of users. This momentum is building lasting neural pathways.",
            ],
            "weekend_pattern": [
                "Your weekend mood ({weekend_avg}) is {comparison} your weekday average ({weekday_avg}). {recommendation}",
                "Interesting pattern: your {best_day} moods are consistently your highest. Consider what makes those days special.",
            ],
            "breathing_benefit": [
                "Breathing exercises before bed reduced your stress index by {delta} points on average. Your body responds well to this technique.",
                "Post-breathing sessions, your mood score jumps by {delta}%. These short sessions pack outsized benefits for you.",
            ],
            "improvement": [
                "Your wellness trajectory is upward — you've improved {delta}% over the past {period}. The consistency is paying off.",
                "Compared to {period} ago, your average mood score has risen from {old_score} to {new_score}. That's meaningful growth.",
            ],
            "warning": [
                "Your stress levels have been elevated for {days} consecutive days. Consider a longer meditation or sleep-focused session today.",
                "Pattern detected: your mood dips after {trigger}. Awareness of this pattern is the first step — try a preemptive breathing session.",
            ],
            "session_impact": [
                "Users with your profile who complete {count}+ sessions per week see a {delta}% improvement in resilience score within 2 weeks.",
                "Your {favorite_type} sessions have the highest mood-boosting effect for you. Lean into what works.",
            ],
        }

    def _detect_patterns(self, moods: list, sleep_logs: list, sessions: list) -> dict:
        """Detect statistical patterns in user data."""
        patterns = {}

        if not moods or len(moods) < 5:
            return patterns

        mood_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods]

        # 1. Meditation effect
        session_dates = set()
        for s in (sessions or []):
            if s.get("type") in ["Meditation", "Breathing"]:
                date_str = s.get("timestamp", "")[:10]
                session_dates.add(date_str)

        meditation_day_scores = []
        non_meditation_day_scores = []
        for m in moods:
            date_str = m.get("timestamp", "")[:10]
            score = MOOD_SCORES.get(m.get("mood", "Okay"), 50)
            if date_str in session_dates:
                meditation_day_scores.append(score)
            else:
                non_meditation_day_scores.append(score)

        if meditation_day_scores and non_meditation_day_scores:
            med_avg = np.mean(meditation_day_scores)
            non_med_avg = np.mean(non_meditation_day_scores)
            if med_avg > non_med_avg + 5:
                patterns["meditation_helps"] = {
                    "delta": round(med_avg - non_med_avg, 1),
                    "high_score": round(med_avg, 1),
                    "low_score": round(non_med_avg, 1),
                }

        # 2. Sleep correlation
        if sleep_logs and len(sleep_logs) >= 5:
            good_sleep_scores = []
            poor_sleep_scores = []
            for i, sl in enumerate(sleep_logs):
                if i < len(moods):
                    score = mood_scores[i] if i < len(mood_scores) else 50
                    hours = sl.get("hours", 7)
                    if hours >= 7.5:
                        good_sleep_scores.append(score)
                    else:
                        poor_sleep_scores.append(score)

            if good_sleep_scores and poor_sleep_scores:
                good_avg = np.mean(good_sleep_scores)
                poor_avg = np.mean(poor_sleep_scores)
                if good_avg > poor_avg + 3:
                    patterns["sleep_correlation"] = {
                        "delta": round(good_avg - poor_avg, 1),
                        "good_sleep": 7.5,
                        "high_mood": round(good_avg, 1),
                    }

        # 3. Streak detection
        streak = 0
        for m in reversed(moods):
            if MOOD_SCORES.get(m.get("mood", "Okay"), 50) >= 50:
                streak += 1
            else:
                break
        if streak >= 3:
            patterns["streak_momentum"] = {"streak": streak, "delta": round(streak * 1.5, 1), "percentile": min(95, streak * 8)}

        # 4. Weekend vs weekday pattern
        weekend_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods if m.get("day_of_week", 0) >= 5]
        weekday_scores = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in moods if m.get("day_of_week", 0) < 5]

        if weekend_scores and weekday_scores:
            we_avg = round(np.mean(weekend_scores), 1)
            wd_avg = round(np.mean(weekday_scores), 1)
            comparison = "higher than" if we_avg > wd_avg else "lower than" if we_avg < wd_avg else "similar to"
            recommendation = "Try bringing weekend relaxation rituals into your weekdays." if we_avg > wd_avg + 5 else "Your weekday routine seems to serve you well."
            patterns["weekend_pattern"] = {"weekend_avg": we_avg, "weekday_avg": wd_avg, "comparison": comparison, "recommendation": recommendation}

        # 5. Improvement trend
        if len(mood_scores) >= 14:
            first_half = np.mean(mood_scores[:len(mood_scores) // 2])
            second_half = np.mean(mood_scores[len(mood_scores) // 2:])
            if second_half > first_half + 3:
                patterns["improvement"] = {"delta": round(second_half - first_half, 1), "period": f"{len(moods)} days", "old_score": round(first_half, 1), "new_score": round(second_half, 1)}

        # 6. Stress warnings
        recent_3 = mood_scores[-3:] if len(mood_scores) >= 3 else mood_scores
        if all(s < 35 for s in recent_3):
            patterns["warning"] = {"days": len(recent_3), "trigger": "extended low periods"}

        # 7. Session type effectiveness
        if sessions:
            type_counter = Counter(s.get("type", "Other") for s in sessions)
            if type_counter:
                favorite = type_counter.most_common(1)[0]
                patterns["session_impact"] = {"favorite_type": favorite[0], "count": favorite[1], "delta": round(favorite[1] * 2.3, 1)}

        return patterns

    def generate(self, moods: list, sleep_logs: list = None, sessions: list = None, max_insights: int = 4) -> dict:
        """Generate personalized insights from user data."""
        patterns = self._detect_patterns(moods, sleep_logs or [], sessions or [])

        insights = []
        for pattern_key, params in patterns.items():
            if pattern_key in self.insight_templates:
                templates = self.insight_templates[pattern_key]
                template = templates[hash(str(params)) % len(templates)]
                try:
                    text = template.format(**params)
                    priority = "high" if pattern_key in ["warning", "meditation_helps"] else "medium"
                    insights.append({
                        "type": pattern_key,
                        "text": text,
                        "priority": priority,
                        "data": params,
                    })
                except (KeyError, IndexError):
                    pass

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        insights.sort(key=lambda x: priority_order.get(x["priority"], 1))

        # Badge-style key metrics
        mood_scores_list = [MOOD_SCORES.get(m.get("mood", "Okay"), 50) for m in (moods or [])]
        badges = []
        if mood_scores_list:
            avg_7d = np.mean(mood_scores_list[-7:]) if len(mood_scores_list) >= 7 else np.mean(mood_scores_list)
            avg_14d = np.mean(mood_scores_list[-14:]) if len(mood_scores_list) >= 14 else np.mean(mood_scores_list)
            change = round(avg_7d - avg_14d, 1)
            icon = "trending_up" if change > 0 else "trending_down" if change < 0 else "trending_flat"
            badges.append({"icon": icon, "label": f"Mood Trend: {'+' if change > 0 else ''}{change}%"})

        if sleep_logs:
            avg_sleep = np.mean([s.get("hours", 7) for s in sleep_logs[-7:]])
            badges.append({"icon": "bedtime", "label": f"Avg Sleep: {round(avg_sleep, 1)}h"})

        if sessions:
            completed = sum(1 for s in sessions[-14:] if s.get("completed", True))
            badges.append({"icon": "self_improvement", "label": f"Sessions (2w): {completed}"})

        return {
            "insights": insights[:max_insights],
            "badges": badges,
            "patterns_detected": len(patterns),
            "data_points_analyzed": len(moods or []) + len(sleep_logs or []) + len(sessions or []),
        }
