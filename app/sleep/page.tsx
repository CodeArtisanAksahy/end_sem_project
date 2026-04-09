export default function SleepTrackerPage() {
  return (
    <>
      
{/*  TopNavBar  */}
<header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
<nav className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
<div className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-wide font-headline">Serene Sanctuary</div>
<div className="hidden md:flex space-x-8 items-center">
<a className="text-slate-500 dark:text-slate-400 hover:opacity-80 transition-opacity font-headline" href="/">Home</a>
<a className="text-blue-600 dark:text-blue-300 font-bold hover:opacity-80 transition-opacity font-headline" href="/sleep">Sleep</a>
<a className="text-slate-500 dark:text-slate-400 hover:opacity-80 transition-opacity font-headline" href="/">Sanctuary</a>
<button className="material-symbols-outlined text-slate-500 dark:text-slate-400 scale-95 active:duration-150">account_circle</button>
</div>
{/*  Mobile Toggle  */}
<button className="md:hidden material-symbols-outlined text-slate-800">menu</button>
</nav>
</header>
<div className="flex min-h-screen pt-24">
{/*  SideNavBar  */}
<aside className="fixed left-0 top-0 h-full w-72 flex flex-col p-6 bg-slate-50 dark:bg-slate-950 hidden md:flex rounded-r-3xl transition-all">
<div className="mb-12 pt-20 px-4">
<h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headline">Welcome back</h2>
<p className="text-slate-400 dark:text-slate-500 text-sm tracking-wide">Find your inner peace</p>
</div>
<nav className="space-y-4 flex-1">
<a className="flex items-center space-x-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors group" href="#">
<span className="material-symbols-outlined">spa</span>
<span className="font-semibold tracking-wide">Sanctuary</span>
</a>
<a className="flex items-center space-x-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors group" href="#">
<span className="material-symbols-outlined">edit_note</span>
<span className="font-semibold tracking-wide">Reflections</span>
</a>
<a className="flex items-center space-x-4 px-4 py-3 rounded-xl text-blue-600 dark:text-blue-300 font-semibold border-r-4 border-blue-400 bg-slate-100 dark:bg-slate-900 group" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>bedtime</span>
<span className="font-semibold tracking-wide">Sleep</span>
</a>
<a className="flex items-center space-x-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors group" href="#">
<span className="material-symbols-outlined">favorite</span>
<span className="font-semibold tracking-wide">Vitals</span>
</a>
<a className="flex items-center space-x-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors group" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-semibold tracking-wide">Settings</span>
</a>
</nav>
<div className="mt-auto px-4 py-6">
<div className="flex items-center space-x-3 bg-surface-container-low p-4 rounded-2xl">
<img className="w-10 h-10 rounded-full object-cover" data-alt="Portrait of a calm woman in soft natural lighting against a neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC41iz63_yHfO0Ld_SBHk9eBNM6lbaUpW2_Yhi8bKLLy-qBlb3N5C7q1V3dkhejNdyBvjolm86cx-HSox85QcYjNAQtxWIzAeQ8bSJyMdoEDGKZCG3LJ3xG2U2WyVnjbR3wtdqlOTFnDrln4PBJbAGKOjmcOEoObM9S0sMjl9wi0pXAZMqksiZBvZXfKkwterFgukOxlA3Xr6gQ5NlI51uuFkYC4Xrp5t4IjfHYLqLr9mfRH0bby9nGO30twso0YJM7OxDyQ9_5c-i5"/>
<div>
<p className="text-xs font-bold text-on-surface">Alex Rivera</p>
<p className="text-[10px] text-on-surface-variant">Premium Member</p>
</div>
</div>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="flex-1 md:ml-72 p-8 max-w-7xl mx-auto w-full">
<header className="mb-10 mt-4">
<h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2">Restful Night</h1>
<p className="text-on-surface-variant tracking-wide">Summary for Thursday, Oct 24</p>
</header>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
{/*  Sleep Quality Score (Circular)  */}
<section className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="relative w-48 h-48 flex items-center justify-center mb-6">
{/*  Simulated Progress Ring  */}
<svg className="w-full h-full transform -rotate-90">
<circle className="text-surface-container-low" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-primary rounded-full" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-dasharray="552" stroke-dashoffset="82" strokeWidth="12"></circle>
</svg>
<div className="absolute flex flex-col items-center">
<span className="text-5xl font-extrabold text-on-surface font-headline">85</span>
<span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Excellent</span>
</div>
</div>
<p className="text-sm text-center text-on-surface-variant leading-relaxed px-4">Your recovery was 12% higher than your 7-day average.</p>
</section>
{/*  Sleep Stages Visualization (Hypnogram)  */}
<section className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl">
<div className="flex justify-between items-end mb-8">
<div>
<h3 className="text-lg font-bold font-headline mb-1">Sleep Stages</h3>
<p className="text-xs text-on-surface-variant tracking-wide">Cycles detected: 5</p>
</div>
<div className="flex space-x-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Awake</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span> REM</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Light</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> Deep</span>
</div>
</div>
<div className="h-48 w-full flex items-end gap-1 px-2">
{/*  Mock Hypnogram Visualization  */}
<div className="flex-1 bg-slate-200 h-[10%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-container h-[40%] rounded-t-sm"></div>
<div className="flex-1 bg-primary h-[80%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-fixed-dim h-[60%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-container h-[45%] rounded-t-sm"></div>
<div className="flex-1 bg-primary h-[90%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-fixed-dim h-[55%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-container h-[40%] rounded-t-sm"></div>
<div className="flex-1 bg-primary h-[85%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-fixed-dim h-[65%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-container h-[50%] rounded-t-sm"></div>
<div className="flex-1 bg-primary-fixed-dim h-[55%] rounded-t-sm"></div>
<div className="flex-1 bg-slate-200 h-[15%] rounded-t-sm"></div>
</div>
<div className="flex justify-between mt-4 px-2 text-[10px] text-on-surface-variant font-bold">
<span>11:00 PM</span>
<span>1:00 AM</span>
<span>3:00 AM</span>
<span>5:00 AM</span>
<span>7:00 AM</span>
</div>
</section>
{/*  Weekly Duration Trends  */}
<section className="lg:col-span-7 bg-surface-container-low p-8 rounded-xl">
<h3 className="text-lg font-bold font-headline mb-8">Weekly Sleep Trend</h3>
<div className="flex items-end justify-between h-40 gap-4 px-4">
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[70%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Mon</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[85%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Tue</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[60%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Wed</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary h-[95%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-primary uppercase">Thu</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[75%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Fri</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[80%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Sat</span>
</div>
<div className="flex flex-col items-center flex-1 gap-4">
<div className="w-full bg-primary-container h-[90%] rounded-t-xl"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Sun</span>
</div>
</div>
</section>
{/*  AI Insights Card (Floating/Glass)  */}
<section className="lg:col-span-5 bg-gradient-to-br from-primary to-primary-dim p-8 rounded-xl text-on-primary shadow-xl flex flex-col justify-between">
<div>
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>auto_awesome</span>
<h3 className="font-headline font-bold text-lg">AI Discovery</h3>
</div>
<p className="text-lg font-medium leading-relaxed opacity-90">
                            "You tended to have deeper sleep on days you completed an evening unwind ritual. Consistency is your superpower this week."
                        </p>
</div>
<div className="mt-8 flex gap-4">
<button className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-all">View Rituals</button>
</div>
</section>
{/*  Environmental Factors  */}
<section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">thermostat</span>
</div>
<div>
<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Room Temp</p>
<p className="text-xl font-bold font-headline">68°F <span className="text-xs font-normal text-secondary ml-1">Optimal</span></p>
</div>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">noise_aware</span>
</div>
<div>
<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Ambient Noise</p>
<p className="text-xl font-bold font-headline">32dB <span className="text-xs font-normal text-secondary ml-1">Quiet</span></p>
</div>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">monitor_heart</span>
</div>
<div>
<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Avg HRV</p>
<p className="text-xl font-bold font-headline">74ms <span className="text-xs font-normal text-secondary ml-1">+4ms</span></p>
</div>
</div>
</section>
{/*  Breathing Space (Signature Component)  */}
<section className="lg:col-span-12 relative h-64 rounded-xl overflow-hidden group">
<img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" data-alt="Dreamy night sky with soft clouds and a giant glowing moon in ethereal blue and purple tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDztciVD3_iDrZVAns-a8-VxYDuBaoGjB5E49gEb3kxnpWwRp-jFVcNdL4a8yw9pDOosbRC3mzvyTbLCtSeR9DXCZ8bvO8OYTpaTD_46hXSYXRDHo-CwkeUnEgAtp-8a7LFD5jp8xY8mZjmBqk7D6lEM0qRiA4oRi_dwpmRkhCZn_4Pg4tuCF_nA4M1HwLsZUCx6U6PMXcMtcZjFv9Sd23BR_xbr57x-XSiWPY3Q2TiAi0tRcAJ5xrODCovS_yBlNrO5AhmdUWWNTO2"/>
<div className="absolute inset-0 bg-secondary-container/30 backdrop-blur-sm"></div>
<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
<h3 className="text-3xl font-extrabold font-headline text-on-secondary-container mb-4">Ready for tonight?</h3>
<p className="text-on-secondary-container opacity-80 mb-6 max-w-md">Sync your environment and start your guided wind-down session now.</p>
<button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-3 hover:scale-105 transition-transform">
<span className="material-symbols-outlined">play_circle</span>
                            Start Wind-down
                        </button>
</div>
</section>
</div>
</main>
</div>
{/*  Mobile Bottom NavBar  */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl flex justify-around items-center py-4 px-6 z-50 rounded-t-3xl shadow-2xl">
<button className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">spa</span>
</button>
<button className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">edit_note</span>
</button>
<button className="flex flex-col items-center gap-1 text-blue-600">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>bedtime</span>
</button>
<button className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">favorite</span>
</button>
<button className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">settings</span>
</button>
</nav>

    </>
  );
}