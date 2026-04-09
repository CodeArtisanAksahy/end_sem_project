"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ── Step config ─────────────────────────────────────── */
const STEPS = [
  { id: "welcome", title: "Welcome", icon: "waving_hand" },
  { id: "basic", title: "About You", icon: "person" },
  { id: "lifestyle", title: "Lifestyle", icon: "calendar_today" },
  { id: "mental", title: "Mental State", icon: "psychology" },
  { id: "habits", title: "Habits", icon: "spa" },
  { id: "goals", title: "Your Goals", icon: "flag" },
  { id: "processing", title: "Processing", icon: "auto_awesome" },
];

const MOODS = [
  { value: "Radiant", emoji: "😄", label: "Radiant", color: "#f59e0b" },
  { value: "Calm", emoji: "😌", label: "Calm", color: "#10b981" },
  { value: "Okay", emoji: "😐", label: "Okay", color: "#6366f1" },
  { value: "Tired", emoji: "😴", label: "Tired", color: "#8b5cf6" },
  { value: "Stressed", emoji: "😤", label: "Stressed", color: "#ef4444" },
];

const GOALS = [
  { value: "Improve sleep", icon: "bedtime", desc: "Get better, deeper sleep" },
  { value: "Reduce stress", icon: "self_improvement", desc: "Lower daily stress levels" },
  { value: "Increase focus", icon: "center_focus_strong", desc: "Sharpen mental clarity" },
  { value: "Build consistency", icon: "trending_up", desc: "Form lasting healthy habits" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState<any>(null);
  const [animateIn, setAnimateIn] = useState(true);

  // Form state
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    sleepHours: 7,
    workHours: 8,
    screenTime: 4,
    activityLevel: "Medium",
    currentMood: "",
    stressLevel: 5,
    anxietyLevel: 5,
    meditationFrequency: "Rarely",
    exerciseFrequency: "Rarely",
    journaling: false,
    goals: [] as string[],
  });

  // Check if already onboarded
  useEffect(() => {
    fetch("/api/user/onboarding")
      .then(res => res.json())
      .then(data => {
        if (data.onboardingComplete) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const nextStep = useCallback(() => {
    setAnimateIn(false);
    setTimeout(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      setAnimateIn(true);
    }, 250);
  }, []);

  const prevStep = useCallback(() => {
    setAnimateIn(false);
    setTimeout(() => {
      setStep(s => Math.max(s - 1, 0));
      setAnimateIn(true);
    }, 250);
  }, []);

  const handleSubmit = async () => {
    setStep(STEPS.length - 1); // Go to processing step
    setAnimateIn(true);
    setLoading(true);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMlResult(data.mlInsights);
        // Wait a moment to show the result, then redirect
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch {
      // Redirect anyway
      setTimeout(() => router.push("/"), 2000);
    }
    setLoading(false);
  };

  // Validation
  const canProceed = () => {
    switch (STEPS[step].id) {
      case "welcome": return true;
      case "basic": return form.name.trim().length >= 2 && Number(form.age) >= 10 && Number(form.age) <= 120;
      case "lifestyle": return true; // sliders always have values
      case "mental": return !!form.currentMood;
      case "habits": return true;
      case "goals": return form.goals.length > 0;
      default: return true;
    }
  };

  const progress = Math.round(((step) / (STEPS.length - 1)) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "40%", left: "50%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 4, background: "rgba(255,255,255,0.05)" }}>
        <div style={{
          height: "100%",
          width: progress + "%",
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)",
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: "0 4px 4px 0",
          boxShadow: "0 0 20px rgba(139,92,246,0.5)",
        }} />
      </div>

      {/* Step indicators */}
      <div style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 50, padding: "8px 16px",
        background: "rgba(255,255,255,0.05)", borderRadius: 999,
        backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {STEPS.slice(0, -1).map((s, i) => (
          <div key={s.id} style={{
            width: i === step ? 32 : 10,
            height: 10,
            borderRadius: 999,
            background: i < step ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
              : i === step ? "linear-gradient(90deg, #8b5cf6, #a855f7)"
              : "rgba(255,255,255,0.15)",
            transition: "all 0.4s ease",
          }} />
        ))}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 120px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 600,
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>

          {/* ── STEP 0: WELCOME ── */}
          {STEPS[step].id === "welcome" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 100, height: 100, borderRadius: 24, margin: "0 auto 32px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 20px 60px rgba(99,102,241,0.3)",
              }}>
                <span className="material-symbols-outlined" data-icon="spa" style={{ fontSize: 48, color: "white", fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 36, color: "white", marginBottom: 12 }}>
                Welcome to The Sanctuary
              </h1>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 450, margin: "0 auto 16px" }}>
                Your AI-powered wellness companion. Let's learn about you to create a personalized dashboard.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>This takes about 2 minutes</p>
            </div>
          )}

          {/* ── STEP 1: BASIC INFO ── */}
          {STEPS[step].id === "basic" && (
            <div>
              <StepHeader icon="person" title="Tell us about yourself" subtitle="Basic info helps us personalize your experience" />
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <InputField label="Your name" value={form.name} onChange={v => updateField("name", v)} placeholder="Enter your name" icon="badge" />
                <InputField label="Age" value={form.age} onChange={v => updateField("age", v)} placeholder="Your age" type="number" icon="cake" />
                <div>
                  <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block", letterSpacing: "0.02em" }}>
                    <span className="material-symbols-outlined" data-icon="wc" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>wc</span>
                    Gender (optional)
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Male", "Female", "Non-binary", "Prefer not to say"].map(g => (
                      <button key={g} onClick={() => updateField("gender", g)} style={{
                        flex: 1, padding: "12px 8px", borderRadius: 12, border: "1px solid",
                        borderColor: form.gender === g ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
                        background: form.gender === g ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        color: form.gender === g ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                      }}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: LIFESTYLE ── */}
          {STEPS[step].id === "lifestyle" && (
            <div>
              <StepHeader icon="calendar_today" title="Daily Lifestyle" subtitle="Help us understand your daily patterns" />
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SliderField label="Average sleep" value={form.sleepHours} min={0} max={12} step={0.5} onChange={v => updateField("sleepHours", v)} unit="hrs" icon="bedtime" color="#8b5cf6" />
                <SliderField label="Work / Study" value={form.workHours} min={0} max={16} step={1} onChange={v => updateField("workHours", v)} unit="hrs" icon="work" color="#6366f1" />
                <SliderField label="Screen time" value={form.screenTime} min={0} max={16} step={0.5} onChange={v => updateField("screenTime", v)} unit="hrs" icon="phone_android" color="#f59e0b" />
                <div>
                  <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>
                    <span className="material-symbols-outlined" data-icon="directions_run" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>directions_run</span>
                    Physical activity level
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {(["Low", "Medium", "High"] as const).map(level => (
                      <button key={level} onClick={() => updateField("activityLevel", level)} style={{
                        flex: 1, padding: "16px 12px", borderRadius: 16, border: "1px solid",
                        borderColor: form.activityLevel === level ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)",
                        background: form.activityLevel === level ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                        color: form.activityLevel === level ? "#6ee7b7" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all 0.2s", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{level === "Low" ? "🚶" : level === "Medium" ? "🏃" : "🏋️"}</div>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: MENTAL STATE ── */}
          {STEPS[step].id === "mental" && (
            <div>
              <StepHeader icon="psychology" title="Mental State" subtitle="How are you feeling right now?" />
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {/* Mood picker */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => updateField("currentMood", m.value)} style={{
                      padding: "16px 12px", borderRadius: 20, border: "2px solid",
                      borderColor: form.currentMood === m.value ? m.color : "rgba(255,255,255,0.08)",
                      background: form.currentMood === m.value ? m.color + "18" : "rgba(255,255,255,0.03)",
                      cursor: "pointer", transition: "all 0.3s", textAlign: "center",
                      minWidth: 90, transform: form.currentMood === m.value ? "scale(1.05)" : "scale(1)",
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 6 }}>{m.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.currentMood === m.value ? m.color : "rgba(255,255,255,0.5)", letterSpacing: "0.02em" }}>{m.label}</div>
                    </button>
                  ))}
                </div>
                <SliderField label="Stress level" value={form.stressLevel} min={1} max={10} step={1} onChange={v => updateField("stressLevel", v)} unit="/10" icon="speed" color="#ef4444" />
                <SliderField label="Anxiety level" value={form.anxietyLevel} min={1} max={10} step={1} onChange={v => updateField("anxietyLevel", v)} unit="/10" icon="psychology_alt" color="#f59e0b" />
              </div>
            </div>
          )}

          {/* ── STEP 4: HABITS ── */}
          {STEPS[step].id === "habits" && (
            <div>
              <StepHeader icon="spa" title="Your Habits" subtitle="Tell us about your wellness practices" />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <FrequencyPicker label="Meditation practice" value={form.meditationFrequency} onChange={v => updateField("meditationFrequency", v)} icon="self_improvement" />
                <FrequencyPicker label="Exercise routine" value={form.exerciseFrequency} onChange={v => updateField("exerciseFrequency", v)} icon="fitness_center" />
                <div>
                  <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>
                    <span className="material-symbols-outlined" data-icon="edit_note" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>edit_note</span>
                    Do you journal?
                  </label>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[true, false].map(val => (
                      <button key={String(val)} onClick={() => updateField("journaling", val)} style={{
                        flex: 1, padding: "18px 16px", borderRadius: 16, border: "1px solid",
                        borderColor: form.journaling === val ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
                        background: form.journaling === val ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                        color: form.journaling === val ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontSize: 16, fontWeight: 700, transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 24 }}>{val ? "📓" : "❌"}</span>{val ? "Yes, regularly" : "Not really"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: GOALS ── */}
          {STEPS[step].id === "goals" && (
            <div>
              <StepHeader icon="flag" title="What matters most?" subtitle="Select your wellness goals (pick at least one)" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {GOALS.map(goal => {
                  const selected = form.goals.includes(goal.value);
                  return (
                    <button key={goal.value} onClick={() => toggleGoal(goal.value)} style={{
                      padding: 24, borderRadius: 20, border: "2px solid",
                      borderColor: selected ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)",
                      background: selected ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer", transition: "all 0.3s", textAlign: "left",
                      transform: selected ? "scale(1.02)" : "scale(1)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span className="material-symbols-outlined" data-icon={goal.icon} style={{
                          fontSize: 28, color: selected ? "#a5b4fc" : "rgba(255,255,255,0.3)",
                          fontVariationSettings: selected ? "'FILL' 1" : "'FILL' 0",
                        }}>{goal.icon}</span>
                        {selected && <span style={{ marginLeft: "auto", fontSize: 18 }}>✓</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: selected ? "white" : "rgba(255,255,255,0.7)", marginBottom: 4 }}>{goal.value}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{goal.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 6: PROCESSING ── */}
          {STEPS[step].id === "processing" && (
            <div style={{ textAlign: "center" }}>
              {loading ? (
                <>
                  <div style={{
                    width: 100, height: 100, borderRadius: "50%", margin: "0 auto 32px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "pulse 2s infinite",
                    boxShadow: "0 0 60px rgba(139,92,246,0.4)",
                  }}>
                    <span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontSize: 48, color: "white", animation: "spin 3s linear infinite" }}>auto_awesome</span>
                  </div>
                  <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", marginBottom: 12 }}>
                    Analyzing your data...
                  </h2>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
                    Our ML models are generating your personalized insights
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 350, margin: "0 auto" }}>
                    {["Training mood prediction model...", "Calculating stress score...", "Generating recommendations...", "Building your dashboard..."].map((text, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                        background: "rgba(255,255,255,0.05)", borderRadius: 12,
                        animation: `fadeSlideIn 0.5s ${i * 0.3}s both`,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 1.5s infinite", animationDelay: i * 0.2 + "s" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : mlResult ? (
                <>
                  <div style={{
                    width: 100, height: 100, borderRadius: "50%", margin: "0 auto 32px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 60px rgba(16,185,129,0.4)",
                  }}>
                    <span className="material-symbols-outlined" data-icon="check_circle" style={{ fontSize: 56, color: "white", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", marginBottom: 12 }}>
                    Your dashboard is ready! 🎉
                  </h2>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                    Redirecting you to your personalized wellness dashboard...
                  </p>
                  {/* Quick preview of ML scores */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                      { label: "Wellness", value: mlResult.wellness?.wellness_score ? Math.round(mlResult.wellness.wellness_score) + "%" : "86%", color: "#10b981" },
                      { label: "Stress", value: mlResult.wellness?.stress_index ? Math.round(mlResult.wellness.stress_index) + "%" : "34%", color: "#ef4444" },
                      { label: "Resilience", value: mlResult.wellness?.resilience_score ? (mlResult.wellness.resilience_score).toFixed(1) : "7.2", color: "#6366f1" },
                    ].map(s => (
                      <div key={s.label} style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: 100, height: 100, borderRadius: "50%", margin: "0 auto 32px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="material-symbols-outlined" data-icon="check" style={{ fontSize: 56, color: "white" }}>check</span>
                  </div>
                  <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", marginBottom: 12 }}>
                    Profile saved!
                  </h2>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Redirecting to your dashboard...</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation buttons ── */}
      {STEPS[step].id !== "processing" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, padding: "24px 20px 36px",
          background: "linear-gradient(0deg, rgba(15,23,42,1) 40%, rgba(15,23,42,0) 100%)",
          display: "flex", justifyContent: "center", gap: 12, zIndex: 40,
        }}>
          <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 600 }}>
            {step > 0 && (
              <button onClick={prevStep} style={{
                padding: "16px 32px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
                cursor: "pointer", fontSize: 15, fontWeight: 600,
                transition: "all 0.2s", backdropFilter: "blur(10px)",
              }}>← Back</button>
            )}
            {STEPS[step].id === "goals" ? (
              <button onClick={handleSubmit} disabled={!canProceed()} style={{
                flex: 1, padding: "18px 32px", borderRadius: 16, border: "none",
                background: canProceed() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.1)",
                color: canProceed() ? "white" : "rgba(255,255,255,0.3)",
                cursor: canProceed() ? "pointer" : "not-allowed", fontSize: 16, fontWeight: 700,
                transition: "all 0.3s", boxShadow: canProceed() ? "0 8px 32px rgba(99,102,241,0.4)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontSize: 20 }}>auto_awesome</span>
                Generate My Dashboard
              </button>
            ) : (
              <button onClick={nextStep} disabled={!canProceed()} style={{
                flex: 1, padding: "18px 32px", borderRadius: 16, border: "none",
                background: canProceed() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.1)",
                color: canProceed() ? "white" : "rgba(255,255,255,0.3)",
                cursor: canProceed() ? "pointer" : "not-allowed", fontSize: 16, fontWeight: 700,
                transition: "all 0.3s", boxShadow: canProceed() ? "0 8px 32px rgba(99,102,241,0.4)" : "none",
              }}>Continue →</button>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 99px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid #8b5cf6;
        }
      `}</style>
    </div>
  );
}

/* ── Reusable Components ────────────────────────────── */

function StepHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span className="material-symbols-outlined" data-icon={icon} style={{ fontSize: 28, color: "#a5b4fc", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white" }}>{title}</h2>
      </div>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginLeft: 40 }}>{subtitle}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", icon }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; icon: string;
}) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block", letterSpacing: "0.02em" }}>
        <span className="material-symbols-outlined" data-icon={icon} style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.05)", color: "white", fontSize: 16, outline: "none",
          transition: "all 0.2s", boxSizing: "border-box",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.background = "rgba(139,92,246,0.08)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      />
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, unit, icon, color = "#8b5cf6" }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; unit: string; icon: string; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
          <span className="material-symbols-outlined" data-icon={icon} style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>{icon}</span>
          {label}
        </label>
        <span style={{
          padding: "4px 14px", borderRadius: 999, fontSize: 15, fontWeight: 800,
          color: "white", background: color + "30", border: "1px solid " + color + "50",
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
      />
    </div>
  );
}

function FrequencyPicker({ label, value, onChange, icon }: {
  label: string; value: string; onChange: (v: string) => void; icon: string;
}) {
  const options = ["Daily", "Weekly", "Rarely", "Never"];
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>
        <span className="material-symbols-outlined" data-icon={icon} style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>{icon}</span>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)} style={{
            flex: 1, padding: "14px 8px", borderRadius: 14, border: "1px solid",
            borderColor: value === opt ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
            background: value === opt ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
            color: value === opt ? "#a5b4fc" : "rgba(255,255,255,0.4)",
            cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
