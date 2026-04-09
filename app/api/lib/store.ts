// In-memory data store — persists across requests during dev server lifetime
// This is the single source of truth for all user data

export interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  timestamp: string;
  note?: string;
}

export interface Session {
  id: string;
  title: string;
  type: string;
  duration: number; // seconds
  startedAt: string;
  completedAt?: string;
  status: "active" | "completed" | "cancelled";
}

export interface Activity {
  id: string;
  title: string;
  type: string;
  time: string;
  detail: string;
  icon: string;
}

export interface SleepLog {
  id: string;
  hours: number;
  quality: number;
  date: string;
  timestamp: string;
  notes?: string;
}

export interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

// ========== ONBOARDING PROFILE ==========
export interface WellnessProfile {
  // Basic Info
  name: string;
  age: number;
  gender: string;

  // Daily Lifestyle
  sleepHours: number;
  workHours: number;
  screenTime: number;
  activityLevel: "Low" | "Medium" | "High";

  // Mental State
  currentMood: string;
  stressLevel: number;
  anxietyLevel: number;

  // Habits
  meditationFrequency: "Daily" | "Weekly" | "Rarely" | "Never";
  exerciseFrequency: "Daily" | "Weekly" | "Rarely" | "Never";
  journaling: boolean;

  // Goals
  goals: string[];

  // Meta
  completedAt: string;
  updatedAt: string;
}

export interface UserData {
  name: string;
  email: string;
  isLoggedIn: boolean;
  joinedDate: string;
  onboardingComplete: boolean;
  wellnessProfile: WellnessProfile | null;
  moods: MoodEntry[];
  sessions: Session[];
  sleepLogs: SleepLog[];
  activities: Activity[];
  chatHistory: ChatMessage[];
  stats: {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
  };
  goals: {
    name: string;
    done: boolean;
  }[];
}

const EMOJI_MAP: Record<string, string> = {
  Radiant: "😄",
  Calm: "😌",
  Okay: "😐",
  Tired: "😴",
  Anxious: "😰",
  Happy: "😊",
  Sad: "😢",
  Stressed: "😤",
};

// ========== GLOBAL STORE ==========
const store: UserData = {
  name: "Julian",
  email: "julian@sanctuary.io",
  isLoggedIn: true,
  joinedDate: "2025-12-01",
  onboardingComplete: false,
  wellnessProfile: null,
  moods: [],
  sessions: [],
  sleepLogs: [],
  activities: [],
  chatHistory: [
    { id: 1, sender: "ai", text: "Hello! I'm your Serene Guide. Complete your wellness profile first so I can give you personalized insights. How are you feeling right now?", time: "09:00 AM" },
  ],
  stats: {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
  },
  goals: [],
};

// Generate activities from sessions
function refreshActivities() {
  store.activities = store.sessions
    .filter(s => s.status === "completed")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10)
    .map(s => {
      const d = new Date(s.startedAt);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / 86400000);
      let timeStr = "";
      if (days === 0) timeStr = "Today, " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      else if (days === 1) timeStr = "Yesterday, " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      else timeStr = d.toLocaleDateString("en-US", { weekday: "long" }) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const iconMap: Record<string, string> = { Meditation: "self_improvement", Sleep: "bedtime", Journaling: "edit_note", Breathing: "air" };
      return {
        id: s.id,
        title: s.title,
        type: s.type,
        time: timeStr,
        detail: Math.round(s.duration / 60) + " mins",
        icon: iconMap[s.type] || "spa",
      };
    });
}

// ========== PUBLIC API ==========

export function getStore(): UserData {
  refreshActivities();
  return store;
}

export function isOnboarded(): boolean {
  return store.onboardingComplete;
}

export function getWellnessProfile(): WellnessProfile | null {
  return store.wellnessProfile;
}

// ========== ONBOARDING ==========
export function saveOnboardingProfile(profile: Omit<WellnessProfile, "completedAt" | "updatedAt">): WellnessProfile {
  const now = new Date().toISOString();
  const fullProfile: WellnessProfile = {
    ...profile,
    completedAt: now,
    updatedAt: now,
  };

  store.wellnessProfile = fullProfile;
  store.onboardingComplete = true;
  store.name = profile.name;

  // Seed initial data from onboarding answers
  seedDataFromProfile(fullProfile);

  return fullProfile;
}

export function updateWellnessProfile(updates: Partial<WellnessProfile>): WellnessProfile | null {
  if (!store.wellnessProfile) return null;
  store.wellnessProfile = {
    ...store.wellnessProfile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Update name if changed
  if (updates.name) store.name = updates.name;

  return store.wellnessProfile;
}

function seedDataFromProfile(profile: WellnessProfile) {
  // Seed mood from current state
  addMood(profile.currentMood);

  // Seed sleep from self-reported hours
  addSleepLog(profile.sleepHours, Math.round(10 - (profile.stressLevel / 2)));

  // Create goals from selected goal strings
  store.goals = [];
  const goalMap: Record<string, string[]> = {
    "Improve sleep": ["Sleep Hygiene Check", "Wind-Down Routine", "Track Sleep Daily"],
    "Reduce stress": ["Daily Breath Exercise", "10-Min Meditation", "Gratitude Journal Entry"],
    "Increase focus": ["10-Min Focus Sprint", "Digital Detox (30m)", "Mindful Walk"],
    "Build consistency": ["Morning Routine", "Evening Reflection", "Weekly Review"],
  };

  for (const goal of profile.goals) {
    const tasks = goalMap[goal] || [];
    for (const task of tasks) {
      store.goals.push({ name: task, done: false });
    }
  }

  // If no goals selected, add defaults
  if (store.goals.length === 0) {
    store.goals = [
      { name: "Daily Breath Exercise", done: false },
      { name: "10-Min Focus Sprint", done: false },
      { name: "Gratitude Journal Entry", done: false },
      { name: "Evening Meditation", done: false },
    ];
  }

  // Seed synthetic historical data for better ML predictions
  seedHistoricalData(profile);

  // Update the AI welcome message
  store.chatHistory = [{
    id: 1,
    sender: "ai",
    text: `Hello, ${profile.name}! 🌿 Welcome to The Sanctuary. I've analyzed your wellness profile — your stress level is ${profile.stressLevel}/10 and you sleep about ${profile.sleepHours} hours. I'm here to help you ${profile.goals.join(", ").toLowerCase()}. How are you feeling right now?`,
    time: "09:00 AM",
  }];
}

// Create realistic historical data based on profile answers
function seedHistoricalData(profile: WellnessProfile) {
  const moodScoreBase: Record<string, number> = { Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10 };
  const baseMoodScore = moodScoreBase[profile.currentMood] || 50;

  // Seed 14 days of mood history
  const moodOptions = ["Radiant", "Calm", "Okay", "Tired", "Anxious", "Stressed"];
  for (let i = 1; i <= 14; i++) {
    const variance = Math.random() * 30 - 15;
    let score = baseMoodScore + variance;
    score = Math.max(10, Math.min(95, score));

    // Find closest mood
    let closestMood = "Okay";
    const moodThresholds = [["Radiant", 85], ["Calm", 65], ["Okay", 45], ["Tired", 25], ["Anxious", 15], ["Stressed", 0]] as [string, number][];
    for (const [m, t] of moodThresholds) {
      if (score >= t) { closestMood = m; break; }
    }

    const ts = new Date(Date.now() - i * 86400000);
    store.moods.push({
      id: "m_seed_" + i,
      mood: closestMood,
      emoji: EMOJI_MAP[closestMood] || "😐",
      timestamp: ts.toISOString(),
    });
  }

  // Seed 14 days of sleep data
  for (let i = 1; i <= 14; i++) {
    const variance = (Math.random() * 2 - 1);
    const hours = Math.max(3, Math.min(12, profile.sleepHours + variance));
    const quality = Math.max(1, Math.min(10, Math.round(10 - profile.stressLevel / 2 + (Math.random() * 3 - 1.5))));
    const d = new Date(Date.now() - i * 86400000);
    store.sleepLogs.push({
      id: "sl_seed_" + i,
      hours: Math.round(hours * 10) / 10,
      quality,
      date: d.toISOString().split("T")[0],
      timestamp: d.toISOString(),
    });
  }

  // Seed sessions based on meditation/exercise frequency
  const freqMap: Record<string, number> = { Daily: 12, Weekly: 5, Rarely: 2, Never: 0 };
  const sessionCount = freqMap[profile.meditationFrequency] || 2;
  const types = ["Meditation", "Breathing", "Journaling"];
  for (let i = 0; i < sessionCount; i++) {
    const d = new Date(Date.now() - (i + 1) * 86400000 * (14 / sessionCount));
    const type = types[i % types.length];
    const duration = type === "Meditation" ? 600 : type === "Breathing" ? 300 : 450;
    store.sessions.push({
      id: "s_seed_" + i,
      title: type === "Meditation" ? "Morning Meditation" : type === "Breathing" ? "Box Breathing" : "Gratitude Journal",
      type,
      duration,
      startedAt: d.toISOString(),
      completedAt: new Date(d.getTime() + duration * 1000).toISOString(),
      status: "completed",
    });
  }

  // Update stats
  const completedSessions = store.sessions.filter(s => s.status === "completed");
  store.stats.totalSessions = completedSessions.length;
  store.stats.totalMinutes = completedSessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
  store.stats.currentStreak = Math.min(sessionCount, 7);
  store.stats.longestStreak = Math.min(sessionCount + 3, 14);

  refreshActivities();
}

export function addMood(mood: string, note?: string): MoodEntry {
  const entry: MoodEntry = {
    id: "m_" + Date.now(),
    mood,
    emoji: EMOJI_MAP[mood] || "😊",
    timestamp: new Date().toISOString(),
    note,
  };
  store.moods.unshift(entry);

  // Update streak
  store.stats.lastActiveDate = new Date().toISOString().split("T")[0];

  return entry;
}

export function getMoodHistory(limit = 7): MoodEntry[] {
  return store.moods.slice(0, limit);
}

export function getTodayMood(): MoodEntry | null {
  const today = new Date().toISOString().split("T")[0];
  return store.moods.find(m => m.timestamp.startsWith(today)) || null;
}

export function startSession(title: string, type: string, durationSeconds: number): Session {
  const session: Session = {
    id: "sess_" + Date.now(),
    title,
    type,
    duration: durationSeconds,
    startedAt: new Date().toISOString(),
    status: "active",
  };
  store.sessions.unshift(session);
  return session;
}

export function completeSession(sessionId: string): Session | null {
  const session = store.sessions.find(s => s.id === sessionId);
  if (!session) return null;
  session.status = "completed";
  session.completedAt = new Date().toISOString();
  store.stats.totalSessions++;
  store.stats.totalMinutes += Math.round(session.duration / 60);
  store.stats.lastActiveDate = new Date().toISOString().split("T")[0];

  // Update goals based on type
  if (session.type === "Breathing") {
    const goal = store.goals.find(g => g.name.includes("Breath"));
    if (goal) goal.done = true;
  }
  if (session.type === "Meditation") {
    const goal = store.goals.find(g => g.name.includes("Meditation") || g.name.includes("Focus"));
    if (goal) goal.done = true;
  }

  refreshActivities();
  return session;
}

export function cancelSession(sessionId: string): Session | null {
  const session = store.sessions.find(s => s.id === sessionId);
  if (!session) return null;
  session.status = "cancelled";
  return session;
}

export function getActiveSession(): Session | null {
  return store.sessions.find(s => s.status === "active") || null;
}

export function addChatMessage(sender: "user" | "ai", text: string): ChatMessage {
  const msg: ChatMessage = {
    id: Date.now(),
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  store.chatHistory.push(msg);
  return msg;
}

export function getChatHistory(): ChatMessage[] {
  return store.chatHistory;
}

export function getWeeklyMoodData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const moodScores: Record<string, number> = { Radiant: 95, Happy: 85, Calm: 70, Okay: 50, Tired: 30, Anxious: 20, Sad: 15, Stressed: 10 };
  const now = new Date();
  const weekData = days.map((day, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayMoods = store.moods.filter(m => m.timestamp.startsWith(dateStr));
    const score = dayMoods.length > 0
      ? Math.round(dayMoods.reduce((sum, m) => sum + (moodScores[m.mood] || 50), 0) / dayMoods.length)
      : 0;
    return { day, score, hasMood: dayMoods.length > 0 };
  });
  return weekData;
}

export function getDashboardData() {
  const hour = new Date().getHours();
  let greeting = "Good evening, " + store.name + ".";
  if (hour < 12) greeting = "Good morning, " + store.name + ".";
  else if (hour < 17) greeting = "Good afternoon, " + store.name + ".";

  const todayMood = getTodayMood();
  const recentMoods = getMoodHistory(5);
  const activeSession = getActiveSession();
  refreshActivities();

  // Generate personalized focus based on profile
  const profile = store.wellnessProfile;
  let focusTitle = "Unwind with Mindful Breathing";
  let focusDesc = "A 10-minute breathing session will help you reset.";
  let focusDuration = 600;

  if (profile) {
    if (profile.stressLevel >= 7) {
      focusTitle = "Stress Relief Breathing";
      focusDesc = `Your stress level is ${profile.stressLevel}/10. This 4-7-8 breathing technique will activate your relaxation response fast.`;
      focusDuration = 480;
    } else if (profile.sleepHours < 6) {
      focusTitle = "Energy Boost Meditation";
      focusDesc = `You're averaging ${profile.sleepHours}hrs of sleep. This focused meditation will help compensate with mental clarity.`;
      focusDuration = 600;
    } else if (profile.anxietyLevel >= 6) {
      focusTitle = "Calm Anxiety Meditation";
      focusDesc = `Your anxiety is at ${profile.anxietyLevel}/10. I recommend grounding meditation to bring your focus to the present.`;
      focusDuration = 900;
    } else {
      focusTitle = "Mindful Morning Flow";
      focusDesc = `You're in a great place, ${store.name}. Let's maintain it with a short mindfulness session.`;
      focusDuration = 600;
    }
  }

  return {
    greeting,
    onboardingComplete: store.onboardingComplete,
    todayMood,
    recentMoods,
    activeSession,
    focus: {
      title: focusTitle,
      description: focusDesc,
      duration: Math.round(focusDuration / 60) + " min",
      durationSeconds: focusDuration,
    },
    recentActivity: store.activities.slice(0, 3),
    progress: {
      mindfulnessMinutes: store.stats.totalMinutes,
      mindfulnessGoal: 150,
      streak: store.stats.currentStreak,
    },
  };
}

export function getStatsData() {
  const weeklyMood = getWeeklyMoodData();
  const completedGoals = store.goals.filter(g => g.done).length;
  const profile = store.wellnessProfile;

  return {
    overview: store.stats,
    weeklyActivity: {
      labels: weeklyMood.map(d => d.day),
      data: weeklyMood.map(d => d.score),
    },
    moodChart: weeklyMood,
    goals: {
      completed: completedGoals,
      total: store.goals.length,
      tasks: store.goals,
    },
    mindfulnessMinutes: { total: store.stats.totalMinutes, goalPercent: Math.min(100, Math.round((store.stats.totalMinutes / 150) * 100)) },
    resilience: { score: profile ? Math.max(3, 10 - profile.stressLevel * 0.5 - profile.anxietyLevel * 0.3 + (profile.meditationFrequency === "Daily" ? 2 : 0)) : 8.4, percentile: 92 },
    aiInsight: store.moods.length > 3
      ? "Your mood pattern shows " + store.moods[0]?.mood + " most recently. You've completed " + store.stats.totalSessions + " sessions totaling " + store.stats.totalMinutes + " minutes. Your consistency streak of " + store.stats.currentStreak + " days is creating measurable improvements in your emotional resilience."
      : "Start tracking your mood daily to unlock personalized AI insights about your emotional patterns.",
    badges: [
      { icon: "trending_down", label: "Cortisol Proxy: -12%" },
      { icon: "bedtime", label: "Deep Sleep: +45m" },
    ],
  };
}

export function setLoggedIn(val: boolean, email?: string) {
  store.isLoggedIn = val;
  if (email) {
    store.email = email;
    store.name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
  }
}

export function toggleGoal(goalName: string): boolean {
  const goal = store.goals.find(g => g.name === goalName);
  if (goal) {
    goal.done = !goal.done;
    return goal.done;
  }
  return false;
}

// ========== SLEEP LOGGING ==========

export function addSleepLog(hours: number, quality: number, notes?: string): SleepLog {
  const today = new Date().toISOString().split("T")[0];
  // Check if already logged today
  const existing = store.sleepLogs.find(s => s.date === today);
  if (existing) {
    existing.hours = hours;
    existing.quality = quality;
    if (notes) existing.notes = notes;
    return existing;
  }
  const entry: SleepLog = {
    id: "sl_" + Date.now(),
    hours,
    quality,
    date: today,
    timestamp: new Date().toISOString(),
    notes,
  };
  store.sleepLogs.unshift(entry);

  // Update sleep hygiene goal
  if (hours >= 7) {
    const goal = store.goals.find(g => g.name.includes("Sleep"));
    if (goal) goal.done = true;
  }

  store.stats.lastActiveDate = today;
  return entry;
}

export function getSleepLogs(limit = 7): SleepLog[] {
  return store.sleepLogs.slice(0, limit);
}

export function getTodaySleep(): SleepLog | null {
  const today = new Date().toISOString().split("T")[0];
  return store.sleepLogs.find(s => s.date === today) || null;
}

// ========== ML DATA EXPORT ==========
// Formats all user data into the shape the ML service expects

const MOOD_SCORES_MAP: Record<string, number> = {
  Radiant: 95, Calm: 75, Okay: 50, Tired: 30, Anxious: 20, Stressed: 10, Happy: 85, Sad: 15,
};

export function getMLFormattedData() {
  return {
    moods: store.moods.map(m => ({
      mood: m.mood,
      score: MOOD_SCORES_MAP[m.mood] || 50,
      timestamp: m.timestamp,
      day_of_week: new Date(m.timestamp).getDay(),
      hour: new Date(m.timestamp).getHours(),
    })),
    sleep_logs: store.sleepLogs.map(s => ({
      hours: s.hours,
      quality: s.quality,
      date: s.date,
      timestamp: s.timestamp,
    })),
    sessions: store.sessions.filter(s => s.status === "completed").map(s => ({
      exercise_id: s.id,
      title: s.title,
      type: s.type,
      duration: s.duration,
      completed: true,
      timestamp: s.startedAt,
      day_of_week: new Date(s.startedAt).getDay(),
    })),
  };
}

export function getDataCollectionSummary() {
  const today = new Date().toISOString().split("T")[0];
  const todayMood = store.moods.find(m => m.timestamp.startsWith(today));
  const todaySleep = store.sleepLogs.find(s => s.date === today);
  const todaySessions = store.sessions.filter(s => s.startedAt.startsWith(today) && s.status === "completed");

  return {
    total_data_points: store.moods.length + store.sleepLogs.length + store.sessions.filter(s => s.status === "completed").length,
    today: {
      mood_logged: !!todayMood,
      mood_value: todayMood?.mood || null,
      sleep_logged: !!todaySleep,
      sleep_hours: todaySleep?.hours || null,
      sessions_completed: todaySessions.length,
    },
    totals: {
      mood_entries: store.moods.length,
      sleep_entries: store.sleepLogs.length,
      completed_sessions: store.sessions.filter(s => s.status === "completed").length,
      days_tracked: new Set([...store.moods.map(m => m.timestamp.split("T")[0]), ...store.sleepLogs.map(s => s.date)]).size,
    },
    ml_ready: store.moods.length >= 3,
    ml_quality: store.moods.length >= 14 && store.sleepLogs.length >= 7 ? "high" : store.moods.length >= 7 ? "medium" : "low",
  };
}
