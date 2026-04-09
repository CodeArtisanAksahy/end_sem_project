"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" });
  }, []);
  return (
    <>
      
{/*  The Navigation Shell is suppressed for this transactional screen per the UX Goal protocol  */}
<main className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden">
{/*  Background Organic Layering  */}
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover opacity-80 mix-blend-multiply" data-alt="Cinematic wide shot of a peaceful still lake at dawn with mist rising over water and soft pastel pink sky" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe6cOayKCms4ozCOnMhIj4O8k-m0K2jo0YB8gvfKuTWbjtmcVtorPbSlSfyc8z41Ec9q9-2oi0fxR9ongDu2VeYINCNzBey-vmUyEd0XKemh9AIWLwv-8rNxAAEJw_1Kimr-tPef6JIoknoFfz3Mg9Wq2lULoFSRvGEIhNEILphoPjSn_OQK_REa0lGudBMQqLgMl3I5bbXhMcK7MPz5c4q_C9sGvf9SvJAdMj5QHpiLTx7jLtOdk8COA6OPinw_dE1oR3tLop74pO"/>
<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
</div>
{/*  Central Content Canvas  */}
<div className="relative z-10 max-w-2xl w-full">
<div className="glass-panel p-8 md:p-16 rounded-xl flex flex-col items-center text-center space-y-10">
{/*  Brand Anchor (Simplified for focus)  */}
<div className="flex flex-col items-center gap-4">
<div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-on-secondary-container text-4xl" data-icon="waves">waves</span>
</div>
<span className="font-headline text-2xl font-bold tracking-wide text-on-surface">Serene Sanctuary</span>
</div>
{/*  Editorial Message  */}
<div className="space-y-6">
<h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
                        A peaceful close.
                    </h1>
<p className="font-body text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-md mx-auto">
                        You are now signed out. We'll be here whenever you need a moment for yourself.
                    </p>
</div>
{/*  Action Cluster  */}
<div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
<a className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-xl font-headline font-bold text-base transition-all hover:scale-[1.02] active:scale-95 text-center" href="/login">
                        Sign back in
                    </a>
<a className="w-full sm:w-auto px-8 py-4 bg-surface-container-low hover:bg-surface-container-high text-primary rounded-xl font-headline font-bold text-base transition-all hover:scale-[1.02] active:scale-95 text-center" href="/">
                        Return Home
                    </a>
</div>
{/*  Footer Breathing Prompt  */}
<div className="pt-8 border-t border-outline-variant/10 w-full">
<p className="text-on-surface-variant font-label tracking-widest uppercase text-xs">
                        The Digital Deep Breath
                    </p>
</div>
</div>
</div>
{/*  Decorative Floating Elements for Depth  */}
<div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
<div className="absolute top-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary-container/30 rounded-full blur-[100px] pointer-events-none"></div>
</main>
{/*  Contextual "Breathing Space" Component (Hidden but structured)  */}
<div className="sr-only">
{/*  This component provides the structural rhythm for the page's organic feel  */}
<div className="bg-secondary-container p-12 rounded-xl shadow-[0_12px_32px_rgba(47,51,52,0.06)]">
<div className="bg-surface-tint opacity-20 blur-3xl absolute inset-0"></div>
</div>
</div>

    </>
  );
}