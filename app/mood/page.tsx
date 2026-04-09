export default function MoodAnalyticsPage() {
  return (
    <>
      
<nav className="fixed top-0 w-full z-50 glass-nav">
<div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
<div className="text-xl font-bold text-sky-800 tracking-[0.02em] font-headline">Serene Sanctuary</div>
<div className="hidden md:flex items-center space-x-8">
<a className="text-slate-500 hover:bg-sky-50 transition-colors px-3 py-1 rounded-md" href="#">Journal</a>
<a className="text-sky-800 font-semibold transition-colors px-3 py-1 rounded-md" href="#">Analytics</a>
<a className="text-slate-500 hover:bg-sky-50 transition-colors px-3 py-1 rounded-md" href="#">Meditate</a>
</div>
<div className="flex items-center space-x-4">
<span className="material-symbols-outlined text-slate-500 cursor-pointer hover:bg-sky-50 p-2 rounded-full transition-colors">account_circle</span>
<span className="material-symbols-outlined text-slate-500 cursor-pointer hover:bg-sky-50 p-2 rounded-full transition-colors">settings</span>
</div>
</div>
</nav>
<div className="flex pt-20">
<aside className="hidden lg:flex flex-col h-[calc(100vh-5rem)] p-8 w-72 bg-surface-container-low rounded-r-xl fixed left-0 top-20">
<div className="mb-10">
<h2 className="font-headline text-2xl font-bold text-sky-900 tracking-wide">Sanctuary</h2>
<p className="text-sm text-slate-500 font-body">Your Digital Deep Breath</p>
</div>
<nav className="flex-1 space-y-2">
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all duration-300 group cursor-pointer">
<span className="material-symbols-outlined group-hover:translate-x-1 duration-300">edit_note</span>
<span className="font-medium">Journal</span>
</div>
<div className="flex items-center space-x-4 p-3 rounded-lg text-sky-800 font-bold border-r-4 border-sky-600 bg-white/50 transition-all duration-300 cursor-default">
<span className="material-symbols-outlined">equalizer</span>
<span className="font-medium">Analytics</span>
</div>
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all duration-300 group cursor-pointer">
<span className="material-symbols-outlined group-hover:translate-x-1 duration-300">self_improvement</span>
<span className="font-medium">Meditate</span>
</div>
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all duration-300 group cursor-pointer">
<span className="material-symbols-outlined group-hover:translate-x-1 duration-300">fitness_center</span>
<span className="font-medium">Activities</span>
</div>
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all duration-300 group cursor-pointer">
<span className="material-symbols-outlined group-hover:translate-x-1 duration-300">psychology</span>
<span className="font-medium">Insights</span>
</div>
</nav>
<div className="mt-auto space-y-2 pt-6 border-t border-outline-variant/10">
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all cursor-pointer">
<span className="material-symbols-outlined">help_outline</span>
<span className="text-sm">Support</span>
</div>
<div className="flex items-center space-x-4 p-3 rounded-lg text-slate-500 hover:bg-white/50 transition-all cursor-pointer">
<span className="material-symbols-outlined">lock</span>
<span className="text-sm">Privacy</span>
</div>
</div>
</aside>
<main className="flex-1 lg:ml-72 p-6 md:p-12 max-w-7xl mx-auto w-full">
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div>
<h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2">Mood Analytics</h1>
<p className="text-on-surface-variant text-lg">Visualizing your path to inner peace.</p>
</div>
<div className="flex bg-surface-container-low p-1.5 rounded-full ghost-border">
<button className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:bg-white/40">Week</button>
<button className="px-6 py-2 rounded-full text-sm font-semibold bg-surface-container-lowest ambient-shadow text-primary transition-all">Month</button>
<button className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:bg-white/40">Year</button>
</div>
</header>
<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
<section className="md:col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 ambient-shadow overflow-hidden relative">
<div className="flex items-center justify-between mb-8">
<h3 className="text-xl font-bold text-on-surface">Emotional Resonance</h3>
<div className="flex items-center space-x-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
<div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary"></span> High</div>
<div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-secondary-fixed"></span> Baseline</div>
</div>
</div>
<div className="h-64 w-full relative flex items-end justify-between pt-4">
<div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
<div className="border-t border-on-surface w-full"></div>
<div className="border-t border-on-surface w-full"></div>
<div className="border-t border-on-surface w-full"></div>
<div className="border-t border-on-surface w-full"></div>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[40%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">M</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[65%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">T</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[55%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">W</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary rounded-full h-[85%] transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">T</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[45%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">F</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[75%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">S</span>
</div>
<div className="group relative flex-1 flex flex-col items-center justify-end h-full">
<div className="w-2 bg-primary/20 rounded-full h-[90%] group-hover:bg-primary transition-all duration-500"></div>
<span className="mt-4 text-[10px] text-on-surface-variant font-label">S</span>
</div>
</div>
</section>
<section className="md:col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col">
<h3 className="text-xl font-bold text-on-surface mb-6">Mood Distribution</h3>
<div className="flex-1 flex flex-col justify-center space-y-6">
<div className="space-y-2">
<div className="flex justify-between text-sm font-medium">
<span>Radiant</span>
<span>42%</span>
</div>
<div className="h-2 w-full bg-surface rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" style={{ width: `42%` }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-sm font-medium">
<span>Calm</span>
<span>35%</span>
</div>
<div className="h-2 w-full bg-surface rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ width: `35%` }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-sm font-medium text-on-surface-variant">
<span>Anxious</span>
<span>12%</span>
</div>
<div className="h-2 w-full bg-surface rounded-full overflow-hidden">
<div className="h-full bg-error/60 rounded-full" style={{ width: `12%` }}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-sm font-medium text-on-surface-variant">
<span>Contemplative</span>
<span>11%</span>
</div>
<div className="h-2 w-full bg-surface rounded-full overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{ width: `11%` }}></div>
</div>
</div>
</div>
</section>
<section className="md:col-span-12 lg:col-span-7 space-y-8">
<div className="bg-primary-container/30 p-8 rounded-xl relative overflow-hidden group">
<div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000"></div>
<h3 className="text-xl font-bold text-on-primary-container mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">auto_awesome</span>
              AI Correlations
            </h3>
<ul className="space-y-4">
<li className="flex items-start gap-4 p-4 bg-white/40 rounded-lg backdrop-blur-sm border border-white/40">
<span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: `'FILL' 1` }}>wb_sunny</span>
<p className="text-on-primary-container text-sm leading-relaxed">You tend to feel more <span className="font-bold">Radiant</span> on days you complete a breathing exercise before 10:00 AM.</p>
</li>
<li className="flex items-start gap-4 p-4 bg-white/40 rounded-lg backdrop-blur-sm border border-white/40">
<span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: `'FILL' 1` }}>dark_mode</span>
<p className="text-on-primary-container text-sm leading-relaxed">Mood dips observed on late work nights (past 9 PM). Consider an earlier 'digital sunset'.</p>
</li>
<li className="flex items-start gap-4 p-4 bg-white/40 rounded-lg backdrop-blur-sm border border-white/40">
<span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontVariationSettings: `'FILL' 1` }}>eco</span>
<p className="text-on-primary-container text-sm leading-relaxed">Increased <span className="font-bold">Calm</span> levels correlate with your 20-minute daily walks in nature.</p>
</li>
</ul>
</div>
</section>
<section className="md:col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl ambient-shadow">
<h3 className="text-xl font-bold text-on-surface mb-6">Emotional Vocabulary</h3>
<div className="flex flex-wrap gap-3">
<span className="px-5 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-sm font-semibold">Grateful</span>
<span className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container text-lg font-bold">Resilient</span>
<span className="px-4 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs">Pensive</span>
<span className="px-6 py-3 rounded-full bg-primary text-on-primary text-xl font-extrabold">Inspired</span>
<span className="px-4 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant text-sm">Quiet</span>
<span className="px-5 py-2 rounded-full bg-tertiary-container text-on-tertiary-container text-base font-semibold">Grounded</span>
<span className="px-4 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs">Uncertain</span>
<span className="px-5 py-2 rounded-full bg-secondary-container text-on-secondary-container text-base font-bold">Harmonious</span>
<span className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant text-sm">Patient</span>
</div>
<div className="mt-10 p-6 bg-secondary-container rounded-xl flex items-center gap-6">
<div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ghost-border p-1">
<img className="w-full h-full object-cover rounded-full" data-alt="Close up of a person practicing yoga in a serene sunlit studio with soft lens flare" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6lIlU7u3Qzwx1JwYExmqsfxUih8JO4k2l17O5hNFpl53QvIRtNrx2kMyUl2NUsLLM6gwZciHhLXd1qMbcwkqLVdC52vD6QfRFM-WBCV8lLike-AD-uBXVcPyXEaJ5FpJqGU9FHpdN8DE5FbpI3XcWbegUMmS-9aArD1GgR0gRy9NPLl4V63R4Obkc-Tr7Y_R4kXbj9h8bhsQuw129MnR30gKlW5W943kPxzgLHih3TbOSh7SV_7TwNz34ZCIkiIpVMuwScr_Zx7Rg"/>
</div>
<div>
<h4 className="font-bold text-on-secondary-container">Weekly Reflection</h4>
<p className="text-xs text-on-secondary-container/80 mt-1">"You've used 14% more positive descriptors than last week. Growth is visible."</p>
</div>
</div>
</section>
</div>
<footer className="mt-20 py-12 border-t border-outline-variant/10 text-center">
<p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">Serene Sanctuary © 2024</p>
<p className="text-on-surface-variant/60 text-xs mt-2">Mindful analytics for a modern life.</p>
</footer>
</main>
</div>
<nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav z-50 flex justify-around items-center px-4 py-3 rounded-t-xl ambient-shadow">
<div className="flex flex-col items-center text-slate-500">
<span className="material-symbols-outlined">edit_note</span>
<span className="text-[10px] mt-1">Journal</span>
</div>
<div className="flex flex-col items-center text-sky-800 font-bold">
<span className="material-symbols-outlined">equalizer</span>
<span className="text-[10px] mt-1">Analytics</span>
</div>
<div className="flex flex-col items-center text-slate-500">
<span className="material-symbols-outlined">self_improvement</span>
<span className="text-[10px] mt-1">Meditate</span>
</div>
<div className="flex flex-col items-center text-slate-500">
<span className="material-symbols-outlined">psychology</span>
<span className="text-[10px] mt-1">Insights</span>
</div>
</nav>

    </>
  );
}