"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ===== MEDITATION TIMER MODAL COMPONENT =====
function MeditationTimer({ session, onComplete, onCancel }: { session: any; onComplete: () => void; onCancel: () => void }) {
  const [timeLeft, setTimeLeft] = useState(session.duration);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t: number) => t - 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete();
    }
  }, [timeLeft, onComplete]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - timeLeft / session.duration;
  const circumference = 2 * Math.PI * 120;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2a3a 0%, #2d4a5c 100%)", borderRadius: 24, padding: 48, textAlign: "center", color: "white", maxWidth: 420, width: "90%", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
        <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 4, opacity: 0.7, marginBottom: 8 }}>{session.type || "Meditation"}</h2>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>{session.title}</h3>
        <div style={{ position: "relative", width: 260, height: 260, margin: "0 auto 32px" }}>
          <svg width="260" height="260" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="130" cy="130" r="120" fill="none" stroke="#7cb8d9" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 56, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 13, opacity: 0.6 }}>{isPaused ? "PAUSED" : "REMAINING"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setIsPaused(!isPaused)} style={{ padding: "12px 28px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button onClick={onCancel} style={{ padding: "12px 28px", borderRadius: 999, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            ✕ End
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== BREATHING EXERCISE MODAL =====
function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const totalCycles = 4;

  useEffect(() => {
    if (cycles >= totalCycles) return;
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            if (p === "inhale") { setCount(7); return "hold"; }
            if (p === "hold") { setCount(8); return "exhale"; }
            if (p === "exhale") { setCycles(cy => cy + 1); setCount(4); return "inhale"; }
            return "inhale";
          });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, cycles]);

  if (cycles >= totalCycles) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
        <div style={{ background: "linear-gradient(135deg, #2d5a4e 0%, #4a7c6f 100%)", borderRadius: 24, padding: 48, textAlign: "center", color: "white", maxWidth: 400, width: "90%" }}>
          <span style={{ fontSize: 64 }}>🧘</span>
          <h3 style={{ fontSize: 24, fontWeight: 800, margin: "16px 0 8px" }}>Beautiful!</h3>
          <p style={{ opacity: 0.8, marginBottom: 24 }}>You completed {totalCycles} breathing cycles. Your body and mind thank you.</p>
          <button onClick={onClose} style={{ padding: "14px 32px", borderRadius: 999, background: "white", color: "#2d5a4e", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 16 }}>Close</button>
        </div>
      </div>
    );
  }

  const bgColors: Record<string, string> = { inhale: "#2d5a4e", hold: "#4a5a6e", exhale: "#5a4e6e" };
  const labels: Record<string, string> = { inhale: "Breathe In", hold: "Hold", exhale: "Breathe Out" };
  const scale = phase === "inhale" ? 1.4 : phase === "hold" ? 1.4 : 0.8;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div style={{ background: "linear-gradient(135deg, " + bgColors[phase] + " 0%, " + bgColors[phase] + "dd 100%)", borderRadius: 24, padding: 48, textAlign: "center", color: "white", maxWidth: 400, width: "90%", transition: "background 1s ease" }}>
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 4, opacity: 0.6, marginBottom: 8 }}>4-7-8 Breathing • Cycle {cycles + 1}/{totalCycles}</p>
        <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{labels[phase] || "Breathe"}</h3>
        <div style={{ width: 180, height: 180, margin: "0 auto 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "scale(" + scale + ")",
            transition: phase === "inhale" ? "transform 4s ease-in-out" : phase === "exhale" ? "transform 8s ease-in-out" : "none",
          }}>
            <span style={{ fontSize: 48, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{count}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", fontWeight: 600, cursor: "pointer" }}>End Early</button>
      </div>
    </div>
  );
}

// ===== MAIN DASHBOARD =====
export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [moodLoading, setMoodLoading] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showSleepLogger, setShowSleepLogger] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [sleepLogged, setSleepLogged] = useState(false);
  const [sleepLoading, setSleepLoading] = useState(false);
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const router = useRouter();

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMsg(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const result = await res.json();
      if (result.onboardingComplete === false) {
        router.push("/onboarding");
        return;
      }
      setData(result);
      if (result.todayMood) setMood(result.todayMood.mood);
      if (result.activeSession) setActiveSession(result.activeSession);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Check sleep status on load
  useEffect(() => {
    fetch("/api/sleep").then(r => r.json()).then(res => {
      if (res.todaySleep) setSleepLogged(true);
    }).catch(() => {});
  }, []);

  const handleMoodSelect = useCallback(async (selectedMood: string) => {
    if (moodLoading) return;
    setMoodLoading(selectedMood);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood }),
      });
      const result = await res.json();
      if (res.ok) {
        setMood(selectedMood);
        showToast(result.message, "success");
        // Store ML prediction if available
        if (result.ml_prediction) {
          setMlPrediction(result.ml_prediction);
        }
        // Refresh data summary
        fetchDashboard();
      } else {
        showToast(result.error || "Failed to log mood", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setMoodLoading(null);
    }
  }, [moodLoading, showToast, fetchDashboard]);

  const handleStartSession = useCallback(async (title: string, type: string, duration: number) => {
    const key = title.replace(/\s/g, "_");
    if (sessionLoading) return;
    setSessionLoading(key);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, duration }),
      });
      const result = await res.json();
      if (res.ok && result.session) {
        showToast(result.message, "success");
        setActiveSession(result.session);
      } else {
        showToast(result.error || "Failed to start", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSessionLoading(null);
    }
  }, [sessionLoading, showToast]);

  const handleCompleteSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      const res = await fetch("/api/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id }),
      });
      const result = await res.json();
      if (res.ok) {
        showToast(result.message, "success");
        setActiveSession(null);
        fetchDashboard(); // Refresh to show updated stats
      }
    } catch { showToast("Network error", "error"); }
  }, [activeSession, showToast, fetchDashboard]);

  const handleCancelSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await fetch("/api/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, action: "cancel" }),
      });
      setActiveSession(null);
      showToast("Session ended early.", "success");
    } catch { /* ignore */ }
  }, [activeSession, showToast]);

  const handleBreathingComplete = useCallback(async () => {
    setShowBreathing(false);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Quick Breathing", type: "Breathing", duration: 60 }),
      });
      const result = await res.json();
      if (result.session) {
        await fetch("/api/session/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: result.session.id }),
        });
      }
    } catch { /* ignore */ }
    showToast("Breathing exercise complete! Your calm is logged.", "success");
    fetchDashboard();
  }, [showToast, fetchDashboard]);

  const handleSleepLog = useCallback(async () => {
    setSleepLoading(true);
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: sleepHours, quality: sleepQuality }),
      });
      const result = await res.json();
      if (res.ok) {
        setSleepLogged(true);
        setShowSleepLogger(false);
        showToast(result.message, "success");
        fetchDashboard(); // Refresh ML predictions with new sleep data
      } else {
        showToast(result.error || "Failed to log sleep", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSleepLoading(false);
    }
  }, [sleepHours, sleepQuality, showToast, fetchDashboard]);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  const moodIcons = ["sentiment_very_satisfied", "sentiment_satisfied", "sentiment_neutral", "sentiment_dissatisfied", "mood_bad", "sentiment_stressed"];
  const moodLabels = ["Radiant", "Calm", "Okay", "Tired", "Anxious", "Stressed"];

  return (
    <>
{/* TIMER MODAL */}
{activeSession && (
  <MeditationTimer session={activeSession} onComplete={handleCompleteSession} onCancel={handleCancelSession} />
)}

{/* BREATHING MODAL */}
{showBreathing && (
  <BreathingExercise onClose={handleBreathingComplete} />
)}

{/* TOAST */}
{toastVisible && (
  <div style={{ position: "fixed", top: 100, right: 24, zIndex: 9999, padding: "16px 24px", borderRadius: 12, color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", backgroundColor: toastType === "success" ? "#3e637f" : "#ef4444", maxWidth: 420 }}>
    {toastMsg}
  </div>
)}

{/* SLEEP LOGGER MODAL */}
{showSleepLogger && (
  <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}>
    <div style={{ background: "linear-gradient(135deg, #1a2a3a 0%, #2d4a5c 100%)", borderRadius: 24, padding: 40, color: "white", maxWidth: 400, width: "90%", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>bedtime</span>
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Log Your Sleep</h3>
          <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>This data directly improves your ML insights</p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, display: "block", marginBottom: 8 }}>Hours of Sleep</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input type="range" min={3} max={12} step={0.5} value={sleepHours}
            onChange={e => setSleepHours(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#7cb8d9" }} />
          <span style={{ fontSize: 28, fontWeight: 900, minWidth: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{sleepHours}h</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4, marginTop: 4 }}>
          <span>3h</span><span>6h</span><span>9h</span><span>12h</span>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, display: "block", marginBottom: 8 }}>Sleep Quality</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
            <button key={q} type="button" onClick={() => setSleepQuality(q)}
              style={{
                flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                background: q <= sleepQuality ? (sleepQuality >= 7 ? "#6b9080" : sleepQuality >= 4 ? "#3e637f" : "#c97a5a") : "rgba(255,255,255,0.1)",
                transition: "all 0.2s", fontSize: 11, color: q <= sleepQuality ? "white" : "rgba(255,255,255,0.3)", fontWeight: 700,
              }}>{q}</button>
          ))}
        </div>
        <p style={{ fontSize: 11, opacity: 0.5, marginTop: 6, textAlign: "center" }}>
          {sleepQuality >= 8 ? "Excellent rest!" : sleepQuality >= 6 ? "Decent sleep" : sleepQuality >= 4 ? "Could be better" : "Poor sleep — rest is priority"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={() => setShowSleepLogger(false)}
          style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        <button type="button" onClick={handleSleepLog} disabled={sleepLoading}
          style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: "#7cb8d9", color: "#1a2a3a", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>
          {sleepLoading ? "Logging..." : "Log Sleep → ML Update"}
        </button>
      </div>
    </div>
  </div>
)}

{/* TOP NAV */}
<nav className="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 backdrop-blur-xl">
<div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto w-full font-['Manrope'] tracking-[0.02em]">
<div className="text-2xl font-bold text-[#2f3334]">Serene Sanctuary</div>
<div className="hidden md:flex items-center space-x-12">
<a className="text-[#3e637f] font-bold border-b-2 border-[#3e637f] pb-1" href="/">Dashboard</a>
<a className="text-[#5b6061] font-medium hover:text-[#3e637f] transition-colors" href="/exercises">Exercises</a>
<a className="text-[#5b6061] font-medium hover:text-[#3e637f] transition-colors" href="/insights">Insights</a>
</div>
<a href="/logout" className="text-[#5b6061] hover:text-[#3e637f] text-sm font-semibold flex items-center gap-2">Logout <span className="material-symbols-outlined">logout</span></a>
</div>
</nav>

{/* SIDEBAR */}
<aside className="hidden lg:flex fixed left-0 top-0 w-72 flex-col p-6 space-y-8 bg-[#f2f4f4] rounded-r-[3rem] h-[calc(100vh-2rem)] my-4 ml-4 shadow-[0_12px_32px_rgba(47,51,52,0.06)] z-40 font-['Plus_Jakarta_Sans']">
<div className="px-4 py-2">
<h1 className="font-['Manrope'] font-bold text-[#2f3334] text-xl">The Sanctuary</h1>
<p className="text-xs text-[#5b6061] opacity-70">Your Digital Deep Breath</p>
</div>
<nav className="flex-1 space-y-2">
<a className="flex items-center space-x-4 bg-white text-[#3e637f] rounded-full px-6 py-3 font-semibold shadow-sm" href="/"><span className="material-symbols-outlined">dashboard</span><span>Home</span></a>
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full transition-all" href="/companion"><span className="material-symbols-outlined">psychology</span><span>Companion</span></a>
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full transition-all" href="/exercises"><span className="material-symbols-outlined">spa</span><span>Library</span></a>
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full transition-all" href="/insights"><span className="material-symbols-outlined">auto_graph</span><span>Stats</span></a>
</nav>
<div className="mt-auto px-4 pb-4">
<button type="button" onClick={() => handleStartSession("Quick Meditation", "Meditation", 120)} className="w-full bg-gradient-to-br from-[#3e637f] to-[#2a4a5c] text-white py-4 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50">
  Start Meditation
</button>
</div>
</aside>

{/* MAIN */}
<main className="lg:ml-80 pt-28 pb-12 px-6 lg:px-12 max-w-7xl mx-auto min-h-screen">
<header className="mb-12">
<h2 className="text-4xl lg:text-5xl font-extrabold text-[#2f3334] mb-2 tracking-tight font-['Manrope']">{data.greeting}</h2>
<p className="text-lg text-[#5b6061] font-medium">Ready to find your center today?</p>
</header>

<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
{/* HERO CARD */}
<section className="md:col-span-8 bg-white rounded-xl p-8 shadow-[0_12px_32px_rgba(47,51,52,0.04)] relative overflow-hidden">
<div className="relative z-10 flex flex-col h-full justify-between max-w-lg">
<div>
<div className="inline-flex items-center space-x-2 bg-[#d6e8f5] text-[#3e637f] px-4 py-1 rounded-full text-xs font-bold mb-6">
<span className="material-symbols-outlined text-sm">auto_awesome</span><span>Daily Focus</span>
</div>
<h3 className="text-3xl font-bold text-[#2f3334] mb-4 leading-tight">{data.focus.title}</h3>
<p className="text-[#5b6061] text-lg mb-8 leading-relaxed">{data.focus.description}</p>
</div>
<button type="button" onClick={() => handleStartSession(data.focus.title, "Breathing", data.focus.durationSeconds)} disabled={!!sessionLoading}
  className="bg-[#3e637f] text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-3 hover:bg-[#2a4a5c] transition-colors disabled:opacity-50">
  {sessionLoading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span><span>Starting...</span></> : <><span>Start Session ({data.focus.duration})</span><span className="material-symbols-outlined">arrow_forward</span></>}
</button>
</div>
<img alt="" className="absolute top-0 right-0 w-64 h-full object-cover opacity-15 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnVqV0JT5_wimzSekiDJNq8zIaXLe8o729zjzQ19ktaukMvD7okme4kMxKBCschYeDEzqx0czGS6s1SAViw98ZxHFx8Q2EA3uVfFUZzgWdwigACuEejiJivg6_wFJRX-WKDFAL2lS8eGm1vLGQpkesrCGyEJiKmgNk3WCjSuPkr0LQIQjsjV_znfeiQ97gTX1CUczEY7KSpMSa9OfBwivo2hvD2Y6SmiOR8C4kho7htVBx_5DPXr-wKpA21Is1DhPLTz8Zup7kNUhD"/>
</section>

{/* MOOD WIDGET */}
<section className="md:col-span-4 bg-[#f2f4f4] rounded-xl p-6 flex flex-col">
<h3 className="text-lg font-bold text-[#2f3334] mb-1">How are you feeling?</h3>
<p className="text-xs text-[#5b6061] mb-3">Your check-ins feed the ML models for personalized insights.</p>

{/* MOOD VITALITY GRAPH (ML TREND) */}
{data.ml?.mood_trend && data.ml.mood_trend.length > 0 && (
  <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border border-[#e5e7e8]">
    <div className="text-[10px] font-bold text-[#b0d6f7] uppercase tracking-wider mb-2 text-[#3e637f]">Vitality ML Trend (Next 7 Days)</div>
    <div className="flex items-end h-12 gap-1">
      {data.ml.mood_trend.map((t: any, i: number) => {
        const h = Math.max(10, Math.min(100, t.predicted_score || 50));
        return (
          <div key={i} className="flex-1 flex flex-col justify-end group relative" title={`${t.day || 'Day ' + (i+1)}: ${Math.round(h)}`}>
            <div className="w-full bg-[#6b9080] rounded-t-sm transition-all hover:bg-[#3e637f]" style={{ height: `${h}%`, opacity: 0.5 + (h / 200) }}></div>
          </div>
        );
      })}
    </div>
  </div>
)}

{mood && <div style={{ padding: "6px 14px", borderRadius: 8, background: "#d6e8f5", color: "#3e637f", fontWeight: 700, fontSize: 12, marginBottom: 8, textAlign: "center" }}>Today: {mood} {data.recentMoods?.find((m: any) => m.mood === mood)?.emoji || ""}</div>}
{mlPrediction && (
  <div style={{ padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, #6b9080, #4a7c6f)", color: "white", fontSize: 11, marginBottom: 8, textAlign: "center", fontWeight: 600 }}>
    ML Prediction: Next mood likely <strong>{mlPrediction.predicted_mood}</strong> ({Math.round(mlPrediction.confidence * 100)}% confidence)
  </div>
)}
<div className="grid grid-cols-3 gap-2 flex-1 mt-auto">
{moodLabels.map((m, i) => {
  const isActive = mood === m;
  const isLoading = moodLoading === m;
  return (
    <button key={m} type="button" onClick={() => handleMoodSelect(m)} disabled={moodLoading !== null}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 12, cursor: "pointer", border: isActive ? "2px solid #3e637f" : "1px solid #e5e7e8", backgroundColor: isActive ? "#d6e8f5" : "white", transform: isActive ? "scale(1.05)" : "scale(1)", boxShadow: isActive ? "0 4px 12px rgba(62,99,127,0.2)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.3s ease", opacity: (moodLoading !== null && !isLoading) ? 0.4 : 1 }}>
      {isLoading ? <span className="material-symbols-outlined text-2xl mb-1 text-[#3e637f] animate-spin">progress_activity</span>
       : <span className="material-symbols-outlined text-2xl mb-1 text-[#3e637f]">{moodIcons[i]}</span>}
      <span style={{ fontSize: 10, fontWeight: 700, color: "#5b6061" }}>{m}</span>
    </button>
  );
})}
</div>
</section>

{/* RECENT ACTIVITY */}
<section className="md:col-span-12">
<div className="flex items-center justify-between mb-6">
<h3 className="text-2xl font-bold text-[#2f3334]">Recent Sanctuary Moments</h3>
<button type="button" onClick={() => router.push("/insights")} className="text-[#3e637f] font-bold text-sm hover:underline">View All Activity</button>
</div>
{data.recentActivity.length > 0 ? (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{data.recentActivity.map((activity: any) => (
  <button key={activity.id} type="button" onClick={() => { showToast("Opening " + activity.title + "..."); setTimeout(() => router.push("/exercises"), 800); }}
    className="bg-white p-6 rounded-xl shadow-sm flex items-start space-x-4 hover:shadow-md transition-all cursor-pointer text-left w-full">
    <div className="bg-[#d6e8f5] p-3 rounded-full">
      <span className="material-symbols-outlined text-[#3e637f]">{activity.icon}</span>
    </div>
    <div>
      <p className="text-sm font-bold text-[#2f3334]">{activity.title}</p>
      <p className="text-xs text-[#5b6061] mb-2">{activity.time}</p>
      <span className="text-xs bg-[#f2f4f4] px-2 py-1 rounded-md text-[#5b6061]">{activity.detail}</span>
    </div>
  </button>
))}
</div>
) : (
<div className="bg-white p-8 rounded-xl text-center text-[#5b6061]">
  <span className="material-symbols-outlined text-4xl mb-2 text-[#3e637f]">self_improvement</span>
  <p className="font-medium">No activity yet. Start your first session above!</p>
</div>
)}
</section>

{/* SLEEP LOGGER CARD */}
<section className="md:col-span-5 bg-white rounded-xl p-8 border border-[#e5e7e8]">
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#3e637f]">bedtime</span>
    <h3 className="text-xl font-bold text-[#2f3334]">Sleep Log</h3>
  </div>
  <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: sleepLogged ? "#d4edda" : "#fff3cd", color: sleepLogged ? "#155724" : "#856404", fontWeight: 700 }}>
    {sleepLogged ? "✓ LOGGED" : "NOT YET"}
  </span>
</div>
<p className="text-sm text-[#5b6061] mb-4">Log last night{"'s"} sleep so the ML model can factor it into your stress & wellness scores.</p>
{sleepLogged ? (
  <div className="bg-[#f2f4f4] rounded-lg p-4 text-center">
    <span className="material-symbols-outlined text-3xl text-[#6b9080] mb-1">check_circle</span>
    <p className="text-sm font-medium text-[#2f3334]">Sleep data logged for today</p>
    <p className="text-xs text-[#5b6061]">Your ML insights have been updated</p>
  </div>
) : (
  <button type="button" onClick={() => setShowSleepLogger(true)}
    className="w-full bg-gradient-to-r from-[#3e637f] to-[#2a4a5c] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
    <span className="material-symbols-outlined">add_circle</span> Log Sleep Now
  </button>
)}
<p className="text-xs text-[#5b6061] mt-3 opacity-60">Data feeds → Stress Model (Ridge Regression) + Wellness Score</p>
</section>

{/* DATA HEALTH / COLLECTION STATUS */}
<section className="md:col-span-7 bg-gradient-to-br from-[#2f3334] to-[#1a2a3a] rounded-xl p-8 text-white relative overflow-hidden">
<div className="flex items-center gap-2 mb-4">
  <span className="material-symbols-outlined text-[#7cb8d9]">hub</span>
  <h3 className="text-xl font-bold">Your Data → ML Pipeline</h3>
  {data.data_summary?.ml_ready && (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#6b9080", fontWeight: 700 }}>ACTIVE</span>
  )}
</div>
<p className="text-sm opacity-70 mb-6">Every mood, sleep log, and session you track feeds directly into 4 ML models for personalized predictions.</p>

<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-white/10 rounded-lg p-4 text-center">
    <p className="text-2xl font-black">{data.data_summary?.totals?.mood_entries || 0}</p>
    <p className="text-xs opacity-60">Mood Entries</p>
    <div style={{ width: 6, height: 6, borderRadius: 3, background: (data.data_summary?.today?.mood_logged ? "#6b9080" : "#ef4444"), margin: "6px auto 0", boxShadow: (data.data_summary?.today?.mood_logged ? "0 0 8px #6b9080" : "0 0 8px #ef4444") }}></div>
  </div>
  <div className="bg-white/10 rounded-lg p-4 text-center">
    <p className="text-2xl font-black">{data.data_summary?.totals?.sleep_entries || 0}</p>
    <p className="text-xs opacity-60">Sleep Logs</p>
    <div style={{ width: 6, height: 6, borderRadius: 3, background: (data.data_summary?.today?.sleep_logged ? "#6b9080" : "#ef4444"), margin: "6px auto 0", boxShadow: (data.data_summary?.today?.sleep_logged ? "0 0 8px #6b9080" : "0 0 8px #ef4444") }}></div>
  </div>
  <div className="bg-white/10 rounded-lg p-4 text-center">
    <p className="text-2xl font-black">{data.data_summary?.totals?.completed_sessions || 0}</p>
    <p className="text-xs opacity-60">Sessions</p>
    <div style={{ width: 6, height: 6, borderRadius: 3, background: ((data.data_summary?.today?.sessions_completed || 0) > 0 ? "#6b9080" : "#ef4444"), margin: "6px auto 0", boxShadow: ((data.data_summary?.today?.sessions_completed || 0) > 0 ? "0 0 8px #6b9080" : "0 0 8px #ef4444") }}></div>
  </div>
</div>

<div className="flex items-center gap-3">
  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
    <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #7cb8d9, #6b9080)", width: (data.data_summary?.ml_quality === "high" ? "100%" : data.data_summary?.ml_quality === "medium" ? "60%" : "30%"), transition: "width 1s" }}></div>
  </div>
  <span style={{ fontSize: 11, fontWeight: 700, color: data.data_summary?.ml_quality === "high" ? "#6b9080" : data.data_summary?.ml_quality === "medium" ? "#7cb8d9" : "#c97a5a" }}>
    ML Data: {(data.data_summary?.ml_quality || "low").toUpperCase()}
  </span>
</div>
<p className="text-xs opacity-40 mt-2">{data.data_summary?.total_data_points || 0} total data points across {data.data_summary?.totals?.days_tracked || 0} days • Green dots = logged today</p>
</section>

{/* AI INSIGHTS & RESILIENCE */}
<section className="md:col-span-7 bg-[#3e637f] rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
<div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
<div className="flex items-center space-x-3 mb-6 relative z-10">
  <span className="material-symbols-outlined text-[#b0d6f7] text-3xl">psychology</span>
  <h3 className="text-xl font-bold">Personalized AI Insight</h3>
  {data.ml?.source && (
    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 999, background: data.ml.source === "gemini" ? "rgba(66,133,244,0.3)" : "rgba(107,144,128,0.3)", color: "white", fontWeight: 700, letterSpacing: 1 }}>
      {data.ml.source === "gemini" ? "✨ GEMINI" : data.ml.source === "python_ml" ? "🧪 ML" : "📊 DATA"}
    </span>
  )}
</div>
<p className="text-lg leading-relaxed opacity-90 relative z-10 mb-8 max-w-lg">
  {data.ml?.insights?.[0]?.text || "Your sanctuary is gathering data to provide unique insights."}
</p>
<div className="flex items-end gap-3 relative z-10 flex-wrap">
  <div className="bg-white/10 rounded-xl px-5 py-3 border border-white/10">
    <div className="text-xs font-bold text-[#b0d6f7] mb-1 uppercase tracking-wider">Resilience Score</div>
    <div className="text-3xl font-black">{data.ml?.wellness?.resilience_score ? data.ml.wellness.resilience_score.toFixed(1) : "N/A"}<span className="text-sm opacity-60 ml-1">/10</span></div>
  </div>
  {(data.ml?.recommendations?.primary_recommendation || data.ml?.recommendations?.[0]) && (
    <div className="bg-white/10 rounded-xl px-5 py-3 border border-white/10 flex-1">
      <div className="text-xs font-bold text-[#b0d6f7] mb-1 uppercase tracking-wider">Suggested</div>
      <div className="text-sm font-bold truncate">{data.ml.recommendations.primary_recommendation?.title || data.ml.recommendations[0]?.title}</div>
      {data.ml.recommendations.primary_recommendation?.reason && (
        <div className="text-xs opacity-60 mt-1 truncate">{data.ml.recommendations.primary_recommendation.reason}</div>
      )}
    </div>
  )}
</div>
</section>

{/* PROGRESS */}
<section className="md:col-span-5 bg-white rounded-xl p-8 border border-[#e5e7e8] flex flex-col justify-center">
<div className="flex items-center space-x-2 mb-6">
<span className="material-symbols-outlined text-[#3e637f]">flag</span>
<h3 className="text-xl font-bold text-[#2f3334]">Your Journey</h3>
</div>
<div className="space-y-6">
<div>
<div className="flex justify-between mb-2">
<span className="text-sm font-medium text-[#5b6061]">Weekly Goals</span>
<span className="text-sm font-bold text-[#3e637f]">
  {data.goals ? Math.round((data.goals.completed / (data.goals.total || 1)) * 100) : 0}%
</span>
</div>
<div className="w-full bg-[#e5e7e8] h-2 rounded-full overflow-hidden">
<div className="bg-[#6b9080] h-full rounded-full transition-all duration-1000" style={{ width: (data.goals ? Math.min(100, Math.round((data.goals.completed / (data.goals.total || 1)) * 100)) : 0) + "%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2">
<span className="text-sm font-medium text-[#5b6061]">Mindfulness Minutes</span>
<span className="text-sm font-bold text-[#3e637f]">{data.progress.mindfulnessMinutes} / {data.progress.mindfulnessGoal} min</span>
</div>
<div className="w-full bg-[#e5e7e8] h-2 rounded-full overflow-hidden">
<div className="bg-[#3e637f] h-full rounded-full transition-all duration-1000" style={{ width: Math.min(100, Math.round((data.progress.mindfulnessMinutes / data.progress.mindfulnessGoal) * 100)) + "%" }}></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2">
<span className="text-sm font-medium text-[#5b6061]">Consistency Streak</span>
<span className="text-sm font-bold text-[#6b9080]">{data.progress.streak} Days</span>
</div>
<div className="flex space-x-2">
{[1, 2, 3, 4, 5, 6, 7].map(day => (
  <div key={day} className={"h-8 flex-1 rounded-md " + (day <= data.progress.streak ? "bg-[#6b9080]" : "bg-[#e5e7e8]")}></div>
))}
</div>
</div>
</div>
</section>

{/* BREATHING SPACE */}
<section className="md:col-span-12 bg-gradient-to-br from-[#6b9080] to-[#4a7c6f] rounded-xl p-8 relative overflow-hidden flex items-center justify-between">
<div className="relative z-10">
<h3 className="text-2xl font-bold text-white mb-2">The Breathing Space</h3>
<p className="text-white/80 max-w-lg mb-6">Enter a quiet zone for immediate stress relief. Guided 4-7-8 breathing technique, proven to reduce anxiety in under 2 minutes.</p>
<button type="button" onClick={() => setShowBreathing(true)}
  className="bg-white text-[#2d5a4e] px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
  <span className="material-symbols-outlined">air</span> Join Session
</button>
</div>
<div className="hidden sm:block w-32 h-32 relative mr-12">
<div className="absolute inset-0 bg-white rounded-full opacity-10 animate-pulse scale-150 blur-xl"></div>
<div className="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse blur-md"></div>
</div>
</section>
</div>
</main>

{/* MOBILE NAV */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-lg border-t border-[#e5e7e8] z-50 px-6 flex justify-between items-center">
<button type="button" onClick={() => router.push("/")} className="flex flex-col items-center space-y-1 text-[#3e637f]">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span><span className="text-[10px] font-bold">Home</span>
</button>
<button type="button" onClick={() => router.push("/companion")} className="flex flex-col items-center space-y-1 text-[#5b6061]">
<span className="material-symbols-outlined">psychology</span><span className="text-[10px] font-bold">Guide</span>
</button>
<button type="button" onClick={() => router.push("/exercises")} className="relative -top-6 bg-[#3e637f] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center">
<span className="material-symbols-outlined text-3xl">add</span>
</button>
<button type="button" onClick={() => router.push("/exercises")} className="flex flex-col items-center space-y-1 text-[#5b6061]">
<span className="material-symbols-outlined">spa</span><span className="text-[10px] font-bold">Relax</span>
</button>
<button type="button" onClick={() => router.push("/insights")} className="flex flex-col items-center space-y-1 text-[#5b6061]">
<span className="material-symbols-outlined">auto_graph</span><span className="text-[10px] font-bold">Stats</span>
</button>
</nav>
    </>
  );
}