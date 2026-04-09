"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Practices");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExercise, setLoadingExercise] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExercises = async (category: string, query: string) => {
    try {
      const params = new URLSearchParams();
      if (category !== "All Practices") params.set("category", category);
      if (query) params.set("q", query);
      const res = await fetch("/api/library?" + params.toString());
      const data = await res.json();
      if (data.exercises) setExercises(data.exercises);
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error("Failed to fetch exercises", e);
    }
  };

  useEffect(() => {
    fetchExercises(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  const handleStartExercise = async (exercise: any) => {
    setLoadingExercise(exercise.id);
    try {
      const res = await fetch("/api/exercises/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, title: exercise.title })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
      } else {
        showToast(data.error || "Failed to start exercise", "error");
      }
    } catch (e) {
      showToast("Network error", "error");
    } finally {
      setLoadingExercise(null);
    }
  };

  const featured = exercises.find(e => e.featured);
  const regular = exercises.filter(e => !e.featured);

  return (
    <>
      {toast && (
        <div className={`fixed top-24 right-8 z-[60] px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-bold text-white transition-all ${toast.type === 'success' ? 'bg-[#3e637f]' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

{/*  TopNavBar  */}
<nav className="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 backdrop-blur-xl transition-colors duration-200">
<div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto w-full">
<div className="text-2xl font-bold text-[#2f3334] font-headline tracking-[0.02em]">Serene Sanctuary</div>
<div className="hidden md:flex items-center space-x-8">
<a className="text-[#5b6061] font-medium font-headline tracking-[0.02em] hover:text-[#3e637f] transition-colors" href="/">Dashboard</a>
<a className="text-[#3e637f] font-bold border-b-2 border-[#3e637f] pb-1 font-headline tracking-[0.02em]" href="/exercises">Exercises</a>
<a className="text-[#5b6061] font-medium font-headline tracking-[0.02em] hover:text-[#3e637f] transition-colors" href="/insights">Insights</a>
</div>
<div className="flex items-center space-x-4">
<a href="/logout" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2">
  Logout <span className="material-symbols-outlined" data-icon="logout">logout</span>
</a>
</div>
</div>
</nav>
{/*  SideNavBar  */}
<aside className="fixed left-0 top-0 w-72 hidden lg:flex flex-col p-6 space-y-8 bg-[#f2f4f4] rounded-r-[3rem] h-[calc(100vh-2rem)] my-4 ml-4 shadow-[0_12px_32px_rgba(47,51,52,0.06)] font-['Plus_Jakarta_Sans'] tracking-wide z-40">
<div className="px-6 py-4">
<h1 className="font-['Manrope'] font-bold text-[#2f3334] text-xl">The Sanctuary</h1>
<p className="text-sm text-on-surface-variant opacity-70">Your Digital Deep Breath</p>
</div>
<nav className="flex-1 space-y-2">
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full hover:translate-x-1 transition-all duration-300" href="/">
<span className="material-symbols-outlined">dashboard</span>
<span>Home</span>
</a>
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full hover:translate-x-1 transition-all duration-300" href="/companion">
<span className="material-symbols-outlined">psychology</span>
<span>Companion</span>
</a>
<a className="flex items-center space-x-4 bg-[#ffffff] text-[#3e637f] rounded-full px-6 py-3 font-semibold shadow-sm hover:translate-x-1 transition-all duration-300" href="/exercises">
<span className="material-symbols-outlined">spa</span>
<span>Library</span>
</a>
<a className="flex items-center space-x-4 text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full hover:translate-x-1 transition-all duration-300" href="/insights">
<span className="material-symbols-outlined">auto_graph</span>
<span>Stats</span>
</a>
</nav>
<div className="mt-auto px-4">
<button onClick={() => router.push('/')} className="w-full bg-gradient-to-br from-primary to-primary-dim text-white py-4 rounded-xl font-bold tracking-wide transition-all active:scale-95">
    Start Meditation
</button>
</div>
</aside>
{/*  Main Content  */}
<main className="lg:ml-80 pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
<header className="mb-12">
<h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4 tracking-tight">Guided Exercises</h2>
<p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Discover a space tailored to your emotional rhythm. Choose a practice that speaks to your current state of mind.</p>
</header>
{/*  Search & Filter  */}
<section className="mb-12">
<div className="flex flex-col md:flex-row gap-6 items-center">
<div className="relative w-full md:max-w-md">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary-container transition-all text-on-surface placeholder:text-outline-variant" placeholder="Find a focus..." type="text"/>
</div>
<div className="flex gap-3 overflow-x-auto pb-2 w-full no-scrollbar">
{categories.map(cat => (
<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'}`}>
  {cat}
</button>
))}
</div>
</div>
</section>
{/*  Exercises Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{featured && (
<div className="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(47,51,52,0.06)]">
<div className="aspect-[16/9] overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={featured.image} alt={featured.title}/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
</div>
<div className="absolute bottom-0 left-0 p-8 text-white w-full flex justify-between items-end">
<div>
<span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-3">Featured Practice</span>
<h3 className="text-3xl font-headline font-bold">{featured.title}</h3>
<p className="opacity-80 text-sm mt-1 font-medium">{featured.description}</p>
</div>
<button onClick={() => handleStartExercise(featured)} disabled={loadingExercise === featured.id} className="bg-white text-primary p-4 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50">
{loadingExercise === featured.id ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>play_arrow</span>}
</button>
</div>
</div>
)}
{regular.map(exercise => (
<div key={exercise.id} className="group bg-surface-container-lowest p-5 rounded-xl shadow-[0_12px_32px_rgba(47,51,52,0.06)] flex flex-col">
<div className="aspect-square rounded-lg overflow-hidden mb-6 relative">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={exercise.image} alt={exercise.title}/>
{exercise.difficulty && (
  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md" style={{ background: exercise.difficulty === "Advanced" ? "rgba(201,122,90,0.85)" : exercise.difficulty === "Intermediate" ? "rgba(62,99,127,0.85)" : "rgba(107,144,128,0.85)", color: "white" }}>
    {exercise.difficulty}
  </span>
)}
</div>
<div className="flex justify-between items-start mb-2">
<span className="text-primary font-bold text-xs uppercase tracking-widest">{exercise.category}</span>
<span className="text-on-surface-variant text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {exercise.duration}</span>
</div>
<h3 className="text-xl font-headline font-bold text-on-surface mb-2">{exercise.title}</h3>
<p className="text-on-surface-variant text-sm leading-relaxed mb-3">{exercise.description}</p>
{exercise.benefits && exercise.benefits.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-4">
    {exercise.benefits.map((b: string) => (
      <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f2f4f4] text-[#5b6061]">{b}</span>
    ))}
  </div>
)}
<div className="mt-auto">
<button onClick={() => handleStartExercise(exercise)} disabled={loadingExercise === exercise.id} className="w-full py-3 px-4 border border-outline-variant/20 rounded-full font-semibold text-primary hover:bg-primary-container/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
  {loadingExercise === exercise.id ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Starting...</> : "Begin Practice"}
</button>
</div>
</div>
))}
{/*  Quick Breathing Card  */}
<div className="bg-secondary-container rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
<div className="absolute -top-10 -right-10 w-40 h-40 bg-surface-tint opacity-10 rounded-full blur-3xl"></div>
<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-surface-tint opacity-10 rounded-full blur-3xl"></div>
<span className="material-symbols-outlined text-4xl text-on-secondary-container mb-4">air</span>
<h3 className="text-2xl font-headline font-extrabold text-on-secondary-container mb-3 tracking-tight">Need a 1-minute break?</h3>
<p className="text-on-secondary-container/80 text-sm mb-6 max-w-[200px] font-medium">Quickly clear your mind with a guided breath cycle.</p>
<button onClick={() => handleStartExercise({ id: "quick-breath", title: "Quick Breath Cycle" })} disabled={loadingExercise === "quick-breath"} className="bg-white text-on-secondary-container px-8 py-3 rounded-full font-bold shadow-sm hover:scale-105 transition-transform disabled:opacity-50">
  {loadingExercise === "quick-breath" ? "Starting..." : "Breathe Now"}
</button>
</div>
</div>
</main>
{/*  Bottom Nav (Mobile)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full glass-nav bg-white/80 px-6 py-4 flex justify-around items-center z-50 border-none shadow-[0_-8px_24px_rgba(47,51,52,0.04)]">
<button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-[10px] font-bold tracking-widest uppercase">Home</span>
</button>
<button className="flex flex-col items-center gap-1 text-primary">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>spa</span>
<span className="text-[10px] font-bold tracking-widest uppercase">Exercises</span>
</button>
<button onClick={() => router.push('/companion')} className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">psychology</span>
<span className="text-[10px] font-bold tracking-widest uppercase">Companion</span>
</button>
<button onClick={() => router.push('/insights')} className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">auto_graph</span>
<span className="text-[10px] font-bold tracking-widest uppercase">Stats</span>
</button>
</nav>
    </>
  );
}