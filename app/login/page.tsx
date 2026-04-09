"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };
  return (
    <>
      
{/*  Suppressed Navigation Shell as per "Destination Rule" (Transactional Flow)  */}
{/*  Ambient Background Elements  */}
<div className="absolute inset-0 z-0 pointer-events-none">
<div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-secondary-container/30 blur-[120px]"></div>
<div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[100px]"></div>
<img className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply" data-alt="Soft focused photograph of misty morning forest with gentle sun rays filtering through pine needles, high-key wellness aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2NEXsi5sUSOVpmIImE-5-bx3GKgJfb2DYN9btD-BsVDOVF9PbNonO-y-mAztk9CWJlWOcJ85mr0OgR2vw-9yLKyp8NazlB74YsDFP0aN__eUds4o6BGv2nYP6gRI24wgj-M1oe4Mj2I3MZR57KeigvUzbJYYCDnmb64kJ5uH9orjiZZP0wOb3Z1lYQRU7d-Q-sYXnSdxpsR4nYbmYN-kVVAD502BDlgpsawanx40Ey2V_IaVlzETEmgXuh4Ca7O37sIIUBqHqGDLz"/>
</div>
{/*  Login Container  */}
<main className="relative z-10 w-full max-w-[480px]">
<div className="glass-panel rounded-xl custom-shadow p-10 md:p-14 flex flex-col items-center">
{/*  Branding  */}
<div className="mb-10 text-center">
<span className="material-symbols-outlined text-primary text-5xl mb-4" data-icon="self_care">self_care</span>
<h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">Serene Sanctuary</h1>
<p className="text-on-surface-variant font-medium tracking-wide">Welcome back to your space of calm.</p>
</div>
{/*  Login Form  */}
<form onSubmit={handleLogin} className="w-full space-y-6">
{/*  Email Input  */}
<div className="space-y-2">
<label className="block label-md font-semibold tracking-wider text-on-surface-variant ml-1">Email Address</label>
<input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary-container rounded-md px-5 py-4 transition-all placeholder:text-outline-variant outline outline-1 outline-outline-variant/20" placeholder="hello@serenity.com" type="email"/>
</div>
{/*  Password Input  */}
<div className="space-y-2">
<div className="flex justify-between items-center px-1">
<label className="label-md font-semibold tracking-wider text-on-surface-variant">Password</label>
<a className="text-sm font-medium text-primary hover:underline" href="/forgot-password">Forgot?</a>
</div>
<input value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary-container rounded-md px-5 py-4 transition-all placeholder:text-outline-variant outline outline-1 outline-outline-variant/20" placeholder="••••••••" type="password"/>
</div>
{/*  Sign In Button  */}
<button type="submit" disabled={loading} className="w-full cta-gradient text-on-primary font-headline font-bold py-4 rounded-xl text-lg active:scale-95 disabled:opacity-50 transition-transform duration-200">
                    {loading ? "Signing In..." : "Sign In"}
                </button>
{/*  Divider  */}
<div className="flex items-center gap-4 py-2">
<div className="h-[1px] flex-1 bg-outline-variant/20"></div>
<span className="label-md text-outline-variant font-medium tracking-widest">OR</span>
<div className="h-[1px] flex-1 bg-outline-variant/20"></div>
</div>
{/*  Social Logins  */}
<div className="grid grid-cols-2 gap-4">
<button className="flex items-center justify-center gap-3 bg-surface-container-lowest border-0 outline outline-1 outline-outline-variant/20 rounded-md py-3.5 hover:bg-surface-bright transition-colors active:scale-98">
<span className="material-symbols-outlined text-xl" data-icon="google">google</span>
<span className="font-semibold text-sm tracking-wide">Google</span>
</button>
<button className="flex items-center justify-center gap-3 bg-surface-container-lowest border-0 outline outline-1 outline-outline-variant/20 rounded-md py-3.5 hover:bg-surface-bright transition-colors active:scale-98">
<span className="material-symbols-outlined text-xl" data-icon="apple">ios</span>
<span className="font-semibold text-sm tracking-wide">Apple</span>
</button>
</div>
</form>
{/*  Footer Link  */}
<div className="mt-12 text-center">
<p className="text-on-surface-variant font-medium">
                    New to the sanctuary? 
                    <a className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4" href="/login">Create an account</a>
</p>
</div>
</div>
{/*  Secondary Quote/Tip (Editorial Style)  */}
<div className="mt-8 text-center px-4">
<p className="italic text-on-surface-variant/70 text-sm leading-relaxed max-w-[320px] mx-auto">
                "Peace is a practice, not a destination. Let's begin today's journey together."
            </p>
</div>
</main>
{/*  Support Link Floating  */}
<div className="fixed bottom-8 right-8">
<button className="p-4 bg-surface-container-lowest rounded-full custom-shadow flex items-center justify-center text-primary-dim hover:text-primary transition-colors group">
<span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
<span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap text-xs font-bold tracking-widest uppercase">Support</span>
</button>
</div>

    </>
  );
}