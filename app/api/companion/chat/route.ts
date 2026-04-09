import { NextResponse } from "next/server";
import {
  getChatHistory,
  addChatMessage,
  getMoodHistory,
  getStore,
  addMood,
  getSleepLogs,
  getMLFormattedData,
  getDataCollectionSummary,
} from "../../lib/store";
import { checkMLService, callMLService } from "../../lib/mongodb";

// ===== INTENT DETECTION =====
type Intent =
  | "vent"
  | "exercise"
  | "mood_log"
  | "mood_query"
  | "insight"
  | "sleep"
  | "stress"
  | "anxiety"
  | "gratitude"
  | "greeting"
  | "help"
  | "breathing"
  | "motivation"
  | "journal"
  | "progress"
  | "general";

interface IntentMatch {
  intent: Intent;
  confidence: number;
  entities: Record<string, string>;
}

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[]; keywords: string[] }[] = [
  {
    intent: "vent",
    patterns: [/i need to (vent|talk|express|let out)/i, /i('m| am) (feeling|having).*(bad|terrible|awful|rough|tough|hard|difficult)/i, /something.*(happened|wrong|bothering)/i],
    keywords: ["vent", "frustrated", "angry", "upset", "overwhelmed", "pissed", "furious", "irritated", "annoyed", "fed up"],
  },
  {
    intent: "exercise",
    patterns: [/suggest.*(exercise|meditation|activity)/i, /(recommend|give me).*(exercise|practice|meditation)/i, /what (should|can) i (do|try|practice)/i],
    keywords: ["exercise", "meditation", "practice", "suggest", "recommend", "activity", "workout"],
  },
  {
    intent: "mood_log",
    patterns: [/log.*(mood|feeling)/i, /i('m| am) feeling (\w+)/i, /my mood is (\w+)/i, /feeling (radiant|calm|okay|tired|anxious|stressed|happy|sad)/i],
    keywords: ["log mood", "log my mood", "track mood", "record mood"],
  },
  {
    intent: "mood_query",
    patterns: [/how (have i|am i|was i) (been )?feeling/i, /my mood (history|pattern|trend)/i, /what('s| is) my mood/i],
    keywords: ["mood history", "mood pattern", "mood trend", "how am i", "my mood"],
  },
  {
    intent: "insight",
    patterns: [/weekly (insight|summary|review)/i, /(give|show|tell).*(insight|summary|analysis)/i, /how (am i|have i been) doing/i],
    keywords: ["insight", "analysis", "summary", "weekly", "progress report", "performance"],
  },
  {
    intent: "sleep",
    patterns: [/can('t| not) sleep/i, /trouble sleeping/i, /help.*(sleep|insomnia|rest)/i, /sleep (tips|advice|better|quality)/i],
    keywords: ["sleep", "insomnia", "rest", "bedtime", "tired", "exhausted", "can't sleep", "sleepless"],
  },
  {
    intent: "stress",
    patterns: [/i('m| am) (so )?(stressed|under pressure)/i, /feeling.*(stressed|pressure|burden)/i, /too much (stress|pressure|work)/i],
    keywords: ["stress", "pressure", "burnout", "overworked", "overwhelm", "deadline"],
  },
  {
    intent: "anxiety",
    patterns: [/i('m| am) (so )?(anxious|worried|panicking)/i, /feeling.*(anxious|worried|nervous|panic)/i, /anxiety|panic attack/i],
    keywords: ["anxious", "anxiety", "worried", "nervous", "panic", "fear", "dread", "phobia"],
  },
  {
    intent: "gratitude",
    patterns: [/i('m| am) (feeling )?(grateful|thankful|blessed)/i, /gratitude/i, /something good happened/i],
    keywords: ["grateful", "thankful", "blessed", "appreciate", "gratitude", "good day", "great day"],
  },
  {
    intent: "greeting",
    patterns: [/^(hi|hello|hey|good (morning|afternoon|evening)|howdy|yo|sup)/i, /^what('s| is) up/i],
    keywords: ["hi", "hello", "hey", "greetings", "good morning", "good evening"],
  },
  {
    intent: "help",
    patterns: [/what can you do/i, /help me/i, /how does this work/i, /your (features|capabilities)/i],
    keywords: ["help", "features", "capabilities", "what can you do", "how to use"],
  },
  {
    intent: "breathing",
    patterns: [/breathing (exercise|technique|practice)/i, /teach me.*(breath|breathing)/i, /box breathing|478|4-7-8/i],
    keywords: ["breathing", "breathe", "breath exercise", "deep breath", "inhale", "exhale"],
  },
  {
    intent: "motivation",
    patterns: [/i (need|want) motivation/i, /motivate me/i, /feeling (unmotivated|lazy|apathetic)/i, /no (energy|motivation)/i],
    keywords: ["motivation", "motivate", "inspire", "unmotivated", "lazy", "apathetic", "no energy", "give up"],
  },
  {
    intent: "journal",
    patterns: [/journal|diary/i, /write (about|down)/i, /reflect(ion)?/i],
    keywords: ["journal", "diary", "write", "reflection", "reflect", "entry"],
  },
  {
    intent: "progress",
    patterns: [/my (progress|stats|data|streak)/i, /how (many|much).*(sessions?|meditation|minutes)/i, /show.*(stats|data|progress)/i],
    keywords: ["progress", "stats", "streak", "data", "sessions", "achievements"],
  },
];

function detectIntent(message: string): IntentMatch {
  const lower = message.toLowerCase().trim();
  let bestMatch: IntentMatch = { intent: "general", confidence: 0, entities: {} };

  for (const { intent, patterns, keywords } of INTENT_PATTERNS) {
    // Check regex patterns (high confidence)
    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match) {
        const conf = 0.9;
        if (conf > bestMatch.confidence) {
          const entities: Record<string, string> = {};
          if (match[2]) entities.value = match[2];
          bestMatch = { intent, confidence: conf, entities };
        }
      }
    }
    // Check keyword overlap (medium confidence)
    const matchCount = keywords.filter(k => lower.includes(k)).length;
    if (matchCount > 0) {
      const conf = Math.min(0.85, 0.3 + matchCount * 0.25);
      if (conf > bestMatch.confidence) {
        bestMatch = { intent, confidence: conf, entities: {} };
      }
    }
  }

  return bestMatch;
}

// ===== EMOTIONAL ANALYSIS =====
function analyzeEmotion(message: string): { valence: number; arousal: number; label: string } {
  const lower = message.toLowerCase();
  const negativeWords = ["sad", "angry", "upset", "frustrated", "anxious", "worried", "stressed", "tired", "exhausted", "afraid", "lonely", "hurt", "pain", "crying", "hopeless", "terrible", "awful", "miserable", "depressed", "overwhelmed"];
  const positiveWords = ["happy", "grateful", "excited", "calm", "peaceful", "great", "wonderful", "amazing", "good", "better", "joyful", "blessed", "thankful", "radiant", "confident", "proud", "love", "beautiful", "fantastic"];
  const highArousal = ["anxious", "panicking", "excited", "angry", "furious", "terrified", "ecstatic", "overwhelmed", "stressed"];
  const lowArousal = ["tired", "exhausted", "calm", "peaceful", "sleepy", "numb", "empty", "bored"];

  const negCount = negativeWords.filter(w => lower.includes(w)).length;
  const posCount = positiveWords.filter(w => lower.includes(w)).length;
  const highCount = highArousal.filter(w => lower.includes(w)).length;
  const lowCount = lowArousal.filter(w => lower.includes(w)).length;

  const valence = posCount > negCount ? 0.7 : negCount > posCount ? -0.7 : 0;
  const arousal = highCount > lowCount ? 0.8 : lowCount > highCount ? -0.5 : 0;

  let label = "neutral";
  if (valence > 0.3) label = arousal > 0.3 ? "excited" : "content";
  else if (valence < -0.3) label = arousal > 0.3 ? "distressed" : "melancholic";

  return { valence, arousal, label };
}

// ===== RESPONSE GENERATORS =====
async function generateResponse(
  intent: IntentMatch,
  message: string,
  emotion: { valence: number; arousal: number; label: string }
): Promise<{ text: string; actions?: any[] }> {
  const store = getStore();
  const recentMoods = getMoodHistory(7);
  const sleepLogs = getSleepLogs(7);
  const stats = store.stats;
  const name = store.name;

  // Try getting ML insights for context
  let mlContext: any = null;
  const mlAvailable = await checkMLService();
  if (mlAvailable && recentMoods.length > 0) {
    const mlData = getMLFormattedData();
    mlContext = await callMLService("/dashboard", {
      ...mlData,
      current_mood: recentMoods[0]?.mood || "Calm",
    });
  }

  switch (intent.intent) {
    case "greeting":
      return generateGreeting(name, recentMoods, stats, mlContext);
    case "vent":
      return generateVentResponse(emotion);
    case "exercise":
      return generateExerciseResponse(recentMoods, mlContext);
    case "mood_log":
      return handleMoodLog(message, intent);
    case "mood_query":
      return generateMoodQuery(recentMoods, mlContext);
    case "insight":
      return generateInsightResponse(stats, recentMoods, sleepLogs, mlContext);
    case "sleep":
      return generateSleepResponse(sleepLogs, stats);
    case "stress":
      return generateStressResponse(mlContext, stats);
    case "anxiety":
      return generateAnxietyResponse(emotion, mlContext);
    case "gratitude":
      return generateGratitudeResponse(name, stats);
    case "help":
      return generateHelpResponse();
    case "breathing":
      return generateBreathingResponse();
    case "motivation":
      return generateMotivationResponse(stats, recentMoods);
    case "journal":
      return generateJournalResponse(recentMoods);
    case "progress":
      return generateProgressResponse(stats, recentMoods, sleepLogs, mlContext);
    default:
      return generateContextualResponse(message, emotion, recentMoods, stats, mlContext);
  }
}

function generateGreeting(name: string, moods: any[], stats: any, ml: any): { text: string } {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const streakMsg = stats.currentStreak > 1 ? ` You're on a ${stats.currentStreak}-day streak — that's real commitment.` : "";
  const moodMsg = moods.length > 0 ? ` I see you logged "${moods[0].mood}" recently.` : "";
  const wellnessMsg = ml?.wellness?.wellness_score ? ` Your wellness score is at ${Math.round(ml.wellness.wellness_score)}%.` : "";

  return {
    text: `${timeGreeting}, ${name}! 🌿${streakMsg}${moodMsg}${wellnessMsg}\n\nI'm your Serene Guide — I can help you:\n• Process emotions or vent 💭\n• Guide breathing & meditation exercises 🧘\n• Track and analyze your mood patterns 📊\n• Offer personalized wellness insights 🔬\n• Recommend exercises based on your data 💡\n\nWhat would feel good right now?`,
  };
}

function generateVentResponse(emotion: { valence: number; arousal: number; label: string }): { text: string } {
  if (emotion.arousal > 0.5) {
    return {
      text: "I can feel the intensity in your words, and I want you to know that's completely okay. Your emotions are valid — every single one of them.\n\nTake a moment right now: put your hand on your chest and feel your heartbeat. It's a reminder that you're here, you're alive, and this feeling is temporary.\n\n💡 When you're ready, here's what might help:\n• **Quick relief**: Try the 4-7-8 breathing technique (inhale 4s, hold 7s, exhale 8s)\n• **Physical release**: Squeeze your fists tight for 10 seconds, then release\n• **Perspective shift**: Name 3 things you can see, 2 you can touch, 1 you can hear\n\nThere's no rush. Tell me more about what's going on when you're ready.",
    };
  }
  return {
    text: "I'm here, fully present and listening. This is your safe space — no judgment, no fixing, just understanding. 🤝\n\nSometimes we carry things that need to be set down, even if just for a moment. Whatever is weighing on you right now, you don't have to hold it alone.\n\nTake your time. Tell me what's on your mind — every word matters.",
  };
}

function generateExerciseResponse(moods: any[], ml: any): { text: string; actions?: any[] } {
  const latestMood = moods.length > 0 ? moods[0].mood : "neutral";
  let recommendation = "";
  let exerciseType = "";

  if (ml?.recommendations?.primary_recommendation) {
    const rec = ml.recommendations.primary_recommendation;
    recommendation = `Based on your recent patterns, I'd most recommend **${rec.title}** (${rec.duration_minutes} min ${rec.type}). ${rec.reason || ""}`;
    exerciseType = rec.type;
  } else {
    const exerciseMap: Record<string, { name: string; desc: string; type: string }> = {
      Anxious: { name: "Progressive Muscle Relaxation", desc: "Systematically tense and release each muscle group. It directly counteracts the physical tension anxiety creates.", type: "Relaxation" },
      Stressed: { name: "Box Breathing", desc: "Inhale 4 seconds, hold 4, exhale 4, hold 4. Military-grade calm in under 3 minutes.", type: "Breathing" },
      Tired: { name: "Yoga Nidra (Conscious Rest)", desc: "10 minutes of guided body awareness that's equivalent to 30 minutes of sleep for restoration.", type: "Sleep" },
      Calm: { name: "Deep Presence Meditation", desc: "A 15-minute mindfulness practice to deepen your existing sense of peace.", type: "Meditation" },
      Radiant: { name: "Gratitude Flow Meditation", desc: "Channel your positive energy into a gratitude practice that strengthens neural pathways for happiness.", type: "Meditation" },
      Okay: { name: "10-Minute Focus Sprint", desc: "A quick mindfulness practice to sharpen your focus and gently elevate your mood.", type: "Meditation" },
    };

    const match = exerciseMap[latestMood] || exerciseMap["Okay"];
    recommendation = `Given you're feeling **${latestMood}**, I'd recommend **${match.name}** — ${match.desc}`;
    exerciseType = match.type;
  }

  return {
    text: `🧘 Here's what I recommend for you right now:\n\n${recommendation}\n\n**Other options you might enjoy:**\n• 🫁 4-7-8 Breathing (2 min) — instant calming\n• 🧘 Body Scan Relaxation (15 min) — full-body awareness\n• 📝 Gratitude Journal (5 min) — rewire for positivity\n• 🌙 Evening Wind-Down (12 min) — better sleep prep\n\nWant me to guide you through any of these, or head to the **Library** for the full collection?`,
  };
}

function handleMoodLog(message: string, intent: IntentMatch): { text: string; actions?: any[] } {
  const moodMap: Record<string, { mood: string; score: number }> = {
    radiant: { mood: "Radiant", score: 95 },
    amazing: { mood: "Radiant", score: 95 },
    great: { mood: "Radiant", score: 90 },
    happy: { mood: "Radiant", score: 85 },
    calm: { mood: "Calm", score: 75 },
    peaceful: { mood: "Calm", score: 75 },
    relaxed: { mood: "Calm", score: 70 },
    good: { mood: "Calm", score: 70 },
    okay: { mood: "Okay", score: 50 },
    fine: { mood: "Okay", score: 50 },
    meh: { mood: "Okay", score: 45 },
    tired: { mood: "Tired", score: 30 },
    exhausted: { mood: "Tired", score: 25 },
    sleepy: { mood: "Tired", score: 30 },
    anxious: { mood: "Anxious", score: 20 },
    worried: { mood: "Anxious", score: 25 },
    nervous: { mood: "Anxious", score: 20 },
    stressed: { mood: "Stressed", score: 10 },
    overwhelmed: { mood: "Stressed", score: 15 },
    sad: { mood: "Tired", score: 25 },
    terrible: { mood: "Stressed", score: 10 },
    awful: { mood: "Stressed", score: 10 },
    bad: { mood: "Tired", score: 25 },
  };

  const lower = message.toLowerCase();
  let detectedMood: string | null = null;

  for (const [keyword, { mood }] of Object.entries(moodMap)) {
    if (lower.includes(keyword)) {
      detectedMood = mood;
      break;
    }
  }

  if (detectedMood) {
    const entry = addMood(detectedMood);
    return {
      text: `✅ I've logged your mood as **${detectedMood}** ${entry.emoji}. Thank you for checking in — self-awareness is the foundation of wellness.\n\n${
        detectedMood === "Radiant" || detectedMood === "Calm"
          ? "Wonderful! Let's channel this positive energy. Want to try a gratitude meditation to amplify this feeling?"
          : detectedMood === "Anxious" || detectedMood === "Stressed"
          ? "I hear you. When you're ready, I have some exercises that can help bring the intensity down. Would you like a breathing exercise, or would you prefer to talk about it?"
          : "Every check-in adds data that makes your ML insights more accurate. Your future predictions will be better because of this log."
      }\n\n📊 *Your mood data is now feeding into the Random Forest mood predictor for more accurate future predictions.*`,
      actions: [{ type: "mood_logged", mood: detectedMood }],
    };
  }

  return {
    text: "I'd love to help you log your mood! How are you feeling right now? You can say things like:\n\n• 😄 **Radiant** — amazing, on top of the world\n• 😌 **Calm** — peaceful, content\n• 😐 **Okay** — neutral, just fine\n• 😴 **Tired** — exhausted, low energy\n• 😰 **Anxious** — worried, nervous\n• 😤 **Stressed** — overwhelmed, tense\n\nOr just describe how you're feeling in your own words — I'll understand!",
  };
}

function generateMoodQuery(moods: any[], ml: any): { text: string } {
  if (moods.length === 0) {
    return { text: "You haven't logged any moods yet. Try typing something like \"I'm feeling calm\" or use the mood widget on your dashboard. The more data you provide, the more accurate your ML predictions become!" };
  }

  const moodCounts: Record<string, number> = {};
  moods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const dominant = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  let mlInsight = "";
  if (ml?.mood?.prediction) {
    mlInsight = `\n\n🤖 **ML Prediction**: Your next mood is likely **${ml.mood.prediction.predicted_mood}** with ${Math.round(ml.mood.prediction.confidence * 100)}% confidence (based on Random Forest analysis of your patterns).`;
  }
  if (ml?.wellness) {
    mlInsight += `\n📊 **Wellness Score**: ${Math.round(ml.wellness.wellness_score)}% | **Stress Index**: ${Math.round(ml.wellness.stress_index)}%`;
  }

  return {
    text: `📈 **Your Recent Mood Pattern** (last ${moods.length} entries):\n\n${moods.slice(0, 5).map(m => `• ${m.emoji} ${m.mood} — ${new Date(m.timestamp).toLocaleDateString()}`).join("\n")}\n\n**Dominant mood**: ${dominant[0]} (${dominant[1]}/${moods.length} entries)${mlInsight}\n\nWant me to dive deeper into what's driving these patterns?`,
  };
}

function generateInsightResponse(stats: any, moods: any[], sleepLogs: any[], ml: any): { text: string } {
  let response = `📊 **Your Wellness Summary**\n\n`;
  response += `📱 **Activity**: ${stats.totalSessions} sessions, ${stats.totalMinutes} total minutes\n`;
  response += `🔥 **Streak**: ${stats.currentStreak} days (best: ${stats.longestStreak})\n`;

  if (moods.length > 0) {
    const moodScores: Record<string, number> = { Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10 };
    const avgScore = moods.reduce((sum, m) => sum + (moodScores[m.mood] || 50), 0) / moods.length;
    response += `🎭 **Avg Mood Score**: ${Math.round(avgScore)}/100\n`;
  }

  if (sleepLogs.length > 0) {
    const avgSleep = sleepLogs.reduce((s, l) => s + l.hours, 0) / sleepLogs.length;
    response += `😴 **Avg Sleep**: ${avgSleep.toFixed(1)} hours/night\n`;
  }

  if (ml?.wellness) {
    response += `\n🔬 **ML-Powered Insights**:\n`;
    response += `• Wellness Score: **${Math.round(ml.wellness.wellness_score)}%**\n`;
    response += `• Stress Index: **${Math.round(ml.wellness.stress_index)}%**\n`;
    response += `• Resilience: **${ml.wellness.resilience_score?.toFixed(1)}/10**\n`;
    response += `• Burnout Risk: **${ml.wellness.burnout_risk || "low"}**\n`;

    if (ml.wellness.breakdown) {
      response += `\n📋 **Breakdown**:\n`;
      response += `• Mood Stability: ${Math.round(ml.wellness.breakdown.mood_stability)}%\n`;
      response += `• Sleep Quality: ${Math.round(ml.wellness.breakdown.sleep_quality)}%\n`;
      response += `• Activity Level: ${Math.round(ml.wellness.breakdown.activity_level)}%\n`;
      response += `• Consistency: ${Math.round(ml.wellness.breakdown.consistency)}%\n`;
    }
  }

  if (ml?.insights?.length > 0) {
    response += `\n💡 **AI-Generated Insights**:\n`;
    ml.insights.slice(0, 3).forEach((i: any) => {
      response += `• ${i.text}\n`;
    });
  }

  response += `\n*All scores are computed in real-time by your ML pipeline (Ridge Regression + Random Forest + KMeans clustering).*`;

  return { text: response };
}

function generateSleepResponse(sleepLogs: any[], stats: any): { text: string } {
  let sleepInfo = "";
  if (sleepLogs.length > 0) {
    const avgSleep = sleepLogs.reduce((s, l) => s + l.hours, 0) / sleepLogs.length;
    const avgQuality = sleepLogs.reduce((s, l) => s + l.quality, 0) / sleepLogs.length;
    sleepInfo = `\n📊 Your recent data: **${avgSleep.toFixed(1)}h avg sleep**, quality **${avgQuality.toFixed(1)}/10**.\n`;
    if (avgSleep < 7) sleepInfo += `⚠️ You're averaging below the recommended 7-9 hours.\n`;
  }

  return {
    text: `🌙 **Sleep Support**\n${sleepInfo}\nHere's your personalized sleep improvement plan:\n\n**Immediate Relief (tonight):**\n1. 🫁 **4-7-8 Breathing**: Inhale 4s → Hold 7s → Exhale 8s (3 cycles). This activates your parasympathetic nervous system.\n2. 📱 **Blue light cutoff**: Stop screens 30 min before bed\n3. 🌡️ **Temperature**: Keep room at 65-68°F (18-20°C)\n\n**This Week:**\n• Try the **Evening Unwind** meditation from our Library (12 min)\n• Log your sleep daily — your ML model gets smarter with each entry\n• Keep a consistent bedtime (±30 min), even on weekends\n\n**Pro Tip**: Your ML stress model uses sleep as a key input. Better sleep logs → more accurate wellness predictions.\n\nWant me to guide you through a relaxation exercise right now?`,
  };
}

function generateStressResponse(ml: any, stats: any): { text: string } {
  let stressData = "";
  if (ml?.wellness) {
    stressData = `\n📊 Your current ML stress index: **${Math.round(ml.wellness.stress_index)}%** (${ml.wellness.burnout_risk || "low"} burnout risk)\n`;
  }

  return {
    text: `🫂 I hear you — stress is your body's way of signaling that something needs attention.${stressData}\n**Let's bring this down together. Choose your path:**\n\n🟢 **Quick Fix (2 min)**: Box Breathing\n→ Inhale 4s → Hold 4s → Exhale 4s → Hold 4s\n→ Repeat 4 times. This directly stimulates your vagus nerve.\n\n🟡 **Medium Reset (10 min)**: Progressive Muscle Relaxation\n→ Systematically tense + release each muscle group\n→ Proven to reduce cortisol by up to 25%\n\n🔴 **Deep Reset (20 min)**: Meditation session\n→ Head to the Library for guided sessions tailored to stress\n\n**What I also recommend:**\n• Log this feeling (I'll track it for your ML model)\n• Take a 5-minute walk if possible\n• Drink water — dehydration amplifies stress signals\n\nWhich approach sounds right for you?`,
  };
}

function generateAnxietyResponse(emotion: any, ml: any): { text: string } {
  return {
    text: `🤲 First: you're safe. Anxiety lies — it tells you something terrible is happening, but right now, in this moment, you are okay.\n\n**Grounding Exercise (do this now):**\n1. Press your feet firmly into the floor\n2. Name **5 things** you can see 👀\n3. Name **4 things** you can touch ✋\n4. Name **3 things** you can hear 👂\n5. Name **2 things** you can smell 👃\n6. Name **1 thing** you can taste 👅\n\nThis technique (5-4-3-2-1) physically redirects your brain from the amygdala (fear center) to the prefrontal cortex (rational thinking).\n\n**Next steps when you're ready:**\n• 🫁 Try the breathing exercise on your dashboard\n• 📝 Write down what you're worried about — externalize it\n• 🧘 Open the Library for anxiety-specific meditations\n\nRemember: anxiety is a wave. It rises, peaks, and always falls back down. You've ridden every wave before this one successfully.\n\nI'm right here with you. Tell me what's on your mind. 💚`,
  };
}

function generateGratitudeResponse(name: string, stats: any): { text: string } {
  return {
    text: `🌟 That's beautiful, ${name}! Gratitude is one of the most powerful mental health practices — neuroscience shows it literally rewires your brain's neural pathways toward positivity.\n\n**Quick Gratitude Practice:**\nLet's do this together. Take a breath, and complete these:\n\n1. Today I'm grateful for... (something small)\n2. A person I appreciate... (and why)\n3. Something about myself I'm proud of...\n\nStudies show that people who practice gratitude daily for 21 days show measurable increases in optimism and decreases in stress markers.\n\n📊 Fun fact: You've completed **${stats.totalSessions} sessions** and maintained a **${stats.currentStreak}-day streak**. That's something to be grateful for too! 🙏\n\nWant to try a Gratitude Flow meditation from the Library?`,
  };
}

function generateHelpResponse(): { text: string } {
  return {
    text: `🧭 **I'm your AI Wellness Companion.** Here's everything I can do:\n\n**🎭 Emotional Support**\n• Vent or process difficult emotions\n• Get anxiety/stress-specific guidance\n• Receive empathetic, non-judgmental listening\n\n**🧘 Exercises & Techniques**\n• Get personalized exercise recommendations\n• Learn breathing techniques (4-7-8, box breathing)\n• Guided grounding exercises for anxiety\n\n**📊 Data & Insights**\n• Log your mood through conversation ("I'm feeling calm")\n• View your mood history and patterns\n• Get ML-powered weekly insights and wellness scores\n• Check your progress and streaks\n\n**🤖 Smart Features**\n• Responses are personalized using your actual mood, sleep, and session data\n• 4 ML models work behind the scenes: mood prediction, stress scoring, insight generation, and exercise recommendations\n\n**Try saying:**\n• "I'm feeling anxious"\n• "Suggest an exercise"\n• "Show me my progress"\n• "I need to vent"\n• "Weekly insight"`,
  };
}

function generateBreathingResponse(): { text: string } {
  return {
    text: `🫁 **Let's breathe together.** I recommend the 4-7-8 technique — it's the most evidence-backed method for instant calm.\n\n**Here's how:**\n\n➡️ **Inhale** through your nose for **4 seconds**\n⏸️ **Hold** your breath for **7 seconds**\n⬅️ **Exhale** slowly through your mouth for **8 seconds**\n\nRepeat 4 times.\n\n**Why it works:** The extended exhale activates your vagus nerve, which signals your brain to switch from "fight or flight" to "rest and digest."\n\n💡 **Pro tip**: You can also use the **Breathing Space** on your dashboard for a visual, guided version with an animated circle and counter.\n\nWant me to count you through a round right now?`,
  };
}

function generateMotivationResponse(stats: any, moods: any[]): { text: string } {
  const streak = stats.currentStreak;
  const total = stats.totalSessions;

  return {
    text: `💪 Look — the fact that you're here, asking for motivation, means that the spark hasn't gone out. It's just waiting for a little oxygen.\n\n**Your reality check:**\n• You've shown up for **${total} sessions** — that's ${total} times you chose growth over comfort\n• Your current streak: **${streak} days** — every builder started with day one\n• Total mindful minutes: **${stats.totalMinutes}** — that's real brain training\n\n**The science of momentum:**\nResearch shows that motivation follows action, not the other way around. You don't need to feel motivated to start — you just need to start for **2 minutes**.\n\n**My challenge for you:**\n1. Start a 2-minute meditation right now (use the button in the sidebar)\n2. If after 2 minutes you want to stop, stop. No guilt.\n3. But most people keep going.\n\n*"The journey of a thousand miles begins with a single breath."*\n\nWant me to suggest a specific exercise to get you started?`,
  };
}

function generateJournalResponse(moods: any[]): { text: string } {
  const prompts = [
    "What emotion showed up most today, and where did you feel it in your body?",
    "Name one thing you handled well today, even if it was small.",
    "Write a letter to your future self about what you're going through right now.",
    "What would you tell a friend in your exact situation?",
    "What are you avoiding right now, and why might it be worth facing?",
  ];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  return {
    text: `📝 **Journaling Prompt**\n\n*"${prompt}"*\n\nJournaling is scientifically proven to:\n• Reduce anxiety by up to 37%\n• Improve immune function\n• Process emotions more effectively\n• Enhance self-awareness\n\n**Quick format** (2 minutes):\n1. 🌅 Morning intention (if morning) OR Evening reflection (if evening)\n2. 🎭 Dominant emotion today: ___\n3. 💡 One thing I learned: ___\n4. 🙏 One thing I'm grateful for: ___\n\nYou can share your reflections with me if you'd like — I'll help you find patterns over time. Or head to the Library for a guided journaling session.`,
  };
}

function generateProgressResponse(stats: any, moods: any[], sleepLogs: any[], ml: any): { text: string } {
  const dataSummary = getDataCollectionSummary();

  let response = `📊 **Your Progress Dashboard**\n\n`;
  response += `🧘 **Sessions**: ${stats.totalSessions} completed (${stats.totalMinutes} min total)\n`;
  response += `🔥 **Streak**: ${stats.currentStreak} days (best: ${stats.longestStreak})\n`;
  response += `🎭 **Mood Entries**: ${dataSummary.totals.mood_entries}\n`;
  response += `😴 **Sleep Logs**: ${dataSummary.totals.sleep_entries}\n`;
  response += `📅 **Days Tracked**: ${dataSummary.totals.days_tracked}\n`;
  response += `📈 **Total Data Points**: ${dataSummary.total_data_points}\n`;
  response += `🤖 **ML Data Quality**: ${dataSummary.ml_quality.toUpperCase()}\n`;

  if (ml?.wellness) {
    response += `\n🔬 **ML Scores (real-time)**:\n`;
    response += `• Wellness: ${Math.round(ml.wellness.wellness_score)}%\n`;
    response += `• Stress: ${Math.round(ml.wellness.stress_index)}%\n`;
    response += `• Resilience: ${ml.wellness.resilience_score?.toFixed(1)}/10\n`;
  }

  response += `\n**To improve your ML predictions**: Log mood daily, sleep nightly, and complete sessions. More data = sharper insights!`;

  return { text: response };
}

function generateContextualResponse(
  message: string,
  emotion: { valence: number; arousal: number; label: string },
  moods: any[],
  stats: any,
  ml: any
): { text: string } {
  // Emotion-aware fallback
  if (emotion.valence < -0.3) {
    const latestMood = moods.length > 0 ? moods[0].mood : "uncertain";
    return {
      text: `I can sense this is weighing on you. ${moods.length > 0 ? `You've been feeling "${latestMood}" recently, ` : ""}and I want you to know that whatever you're going through, it's valid.\n\nSome options that might help right now:\n• 💬 Tell me more about what's going on — I'm here to listen\n• 🫁 Quick breathing exercise to center yourself\n• 📊 Let me check your wellness data for patterns\n• 🧘 Try a calming meditation from the Library\n\nWhat resonates most?`,
    };
  }

  if (emotion.valence > 0.3) {
    return {
      text: `I love the positive energy! 🌟 That's wonderful to hear.\n\nYou know what's great? Positive states are the perfect time to build healthy habits because your brain is most receptive to new patterns when you're feeling good.\n\n**Suggestions to amplify this:**\n• 📝 Write a quick gratitude entry\n• 🧘 Try an advanced focus meditation\n• 📊 Check your progress — you've earned ${stats.totalSessions} sessions!\n\nWhat would you like to explore?`,
    };
  }

  // Intelligent generic response with context
  const contextItems = [];
  if (moods.length > 0) contextItems.push(`Your latest mood was "${moods[0].mood}"`);
  if (stats.currentStreak > 0) contextItems.push(`you're on a ${stats.currentStreak}-day streak`);
  if (ml?.wellness) contextItems.push(`your wellness score is ${Math.round(ml.wellness.wellness_score)}%`);
  const contextStr = contextItems.length > 0 ? `\n\n📊 *Quick context: ${contextItems.join(", ")}.*` : "";

  return {
    text: `I hear you. I want to make sure I give you the most helpful response possible.${contextStr}\n\nHere's what I can help with:\n• 😊 **Emotional support** — vent, process, or celebrate\n• 🧘 **Exercises** — breathing, meditation, journaling\n• 📊 **Your data** — mood patterns, progress, ML insights\n• 💡 **Personalized tips** — based on your actual wellness data\n\nTry saying something like "I'm feeling stressed" or "suggest an exercise" — or just tell me what's on your mind!`,
  };
}

// ===== API ROUTES =====

export async function GET() {
  return NextResponse.json({
    messages: getChatHistory(),
    suggestedPrompts: [
      "I need to vent",
      "Suggest an exercise",
      "Log my mood",
      "I'm feeling anxious",
      "Help me sleep",
      "Weekly insight",
      "Show my progress",
      "Teach me breathing",
    ],
  });
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Store user message
    addChatMessage("user", message);

    // Detect intent + emotion (used for logging and fallback)
    const intent = detectIntent(message);
    const emotion = analyzeEmotion(message);

    // Handle mood logging locally (needs side effects the AI can't do)
    if (intent.intent === "mood_log" && intent.confidence > 0.5) {
      const response = handleMoodLog(message, intent);
      const reply = addChatMessage("ai", response.text);
      return NextResponse.json({
        success: true,
        reply,
        intent: intent.intent,
        confidence: intent.confidence,
        emotion: emotion.label,
        actions: response.actions || [],
        ai_source: "local+mood_action",
      });
    }

    // ===== TRY GEMINI FIRST =====
    const store = getStore();
    const recentMoods = getMoodHistory(7);
    const sleepLogs = getSleepLogs(7);

    let geminiResponse = "";
    try {
      const { geminiChat } = await import("../../lib/gemini");
      geminiResponse = await geminiChat(message, {
        userName: store.name,
        recentMoods,
        sleepLogs,
        stats: store.stats,
        wellnessProfile: store.wellnessProfile,
      });
    } catch (err) {
      console.error("[Companion] Gemini call failed, using fallback:", err);
    }

    let responseText: string;
    let aiSource: string;
    let actions: any[] = [];

    if (geminiResponse && geminiResponse.length > 10) {
      // Gemini responded successfully
      responseText = geminiResponse;
      aiSource = "gemini";
    } else {
      // Fallback to local intent system
      const fallback = await generateResponse(intent, message, emotion);
      responseText = fallback.text;
      actions = fallback.actions || [];
      aiSource = "local_fallback";
    }

    // Store AI response
    const reply = addChatMessage("ai", responseText);

    return NextResponse.json({
      success: true,
      reply,
      intent: intent.intent,
      confidence: intent.confidence,
      emotion: emotion.label,
      actions,
      ai_source: aiSource,
    });
  } catch (e) {
    console.error("[Companion Chat] Error:", e);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

