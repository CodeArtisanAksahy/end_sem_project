"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Password reset link sent securely.");
      router.push("/login");
    } else {
      alert("Please enter a valid email address.");
    }
  };
  return (
    <>
      
{/*  Focused View Header (Rule 3)  */}
<nav className="fixed top-0 w-full glass-header z-50 px-6 py-4 flex items-center justify-between">
<div className="flex items-center gap-2">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
</button>
<span className="font-label text-label-md tracking-[0.02em] text-on-surface-variant">Back</span>
</div>
<div className="flex items-center gap-2">
<div className="size-6 text-primary">
<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
</svg>
</div>
<h1 className="font-headline font-bold text-lg tracking-tight">Serene Sanctuary</h1>
</div>
<div className="w-12"></div> {/*  Spacer for balance  */}
</nav>
<main className="flex-1 flex items-center justify-center p-6 mt-16">
{/*  Main Auth Container  */}
<div className="w-full max-w-[480px] flex flex-col items-center">
{/*  Hero Image / Visual Break  */}
<div className="w-full mb-12 overflow-hidden rounded-xl h-48 bg-surface-container-low">
<div className="w-full h-full bg-center bg-cover" data-alt="Soft focused photograph of sunlight filtering through green leaves in a quiet misty forest creating a calming atmosphere" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAYiteGQjeX4Eb4yvSJhC3SkQsyB3laSrFP4OKwNLnPpASHz2FbocOshxyTJKcr7AKcEyErzB3FBFqcRWk53DCB2QPj1tl9dMLH7lSQxjIVyV4N4bfQSFWVv_Jp00yicXlDqCKjHbWPrVbRQfKeEQ19qRCjl0oDd06obKTqGX6fAhNo1wUsNMmwBjAi039kBXNIyt77pDuXkpfpJidE8utz_2Q_hi38b6JqKo3q3VwyjFw-SoBKDBIn4EtTncUr-Zm33gsND-z20pI9')` }}>
</div>
</div>
{/*  Content Card  */}
<div className="w-full bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_12px_32px_rgba(47,51,52,0.04)]">
<div className="text-center mb-8">
<h2 className="font-headline text-[32px] font-bold text-on-surface leading-tight mb-3">Forgot Password?</h2>
<p className="font-body text-on-surface-variant text-base leading-relaxed">
                        Don't worry, it happens. Enter your email address and we'll send you a link to reset your password.
                    </p>
</div>
<form onSubmit={handleSubmit} className="space-y-6">
<div className="flex flex-col gap-2">
<label className="font-label text-sm font-semibold tracking-[0.02em] text-on-surface-variant ml-1" htmlFor="email">
                            Email Address
                        </label>
<input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-14 px-5 rounded-xl bg-surface-container-low border border-outline-variant/20 focus:border-primary/40 focus:bg-surface-container-lowest focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body" id="email" placeholder="hello@serenity.com" type="email"/>
</div>
<button disabled={loading} className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-base tracking-[0.015em] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2" type="submit">
<span>{loading ? "Sending..." : "Send Reset Link"}</span>
<span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</form>
<div className="mt-8 flex justify-center">
<a className="inline-flex items-center gap-2 text-primary font-label font-semibold text-sm tracking-wide hover:underline underline-offset-4 decoration-2" href="/login">
<span className="material-symbols-outlined text-[18px]" data-icon="login">login</span>
                        Back to Login
                    </a>
</div>
</div>
{/*  Supporting Footer Content (Minimal)  */}
<div className="mt-12 text-center max-w-[280px]">
<p className="font-body text-xs text-on-surface-variant/60 leading-relaxed italic">
                    "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts."
                </p>
</div>
</div>
</main>
{/*  Visual Signature: The Breathing Space (System 5)  */}
<div className="fixed -bottom-24 -left-24 size-64 bg-secondary-container opacity-20 rounded-full blur-[80px] -z-10"></div>
<div className="fixed -top-24 -right-24 size-96 bg-primary-container opacity-20 rounded-full blur-[100px] -z-10"></div>

    </>
  );
}