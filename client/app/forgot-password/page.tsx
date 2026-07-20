"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getPublicAppOrigin } from "@/lib/app-origin";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const parseCooldown = (msg: string): number => {
    const match = msg.match(/(\d+)\s*seconds?/i);
    if (match) return parseInt(match[1], 10);
    return 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getPublicAppOrigin()}/reset-password`,
      });
      if (resetError) {
        if (/rate\s*limit|too\s*many|cooldown/i.test(resetError.message)) {
          const seconds = parseCooldown(resetError.message);
          setCooldown(seconds);
          setError("You've requested too many password resets. Please wait.");
        } else {
          setError(resetError.message || "Something went wrong. Please try again.");
        }
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      <style jsx>{`
        .auth-gradient {
          background: radial-gradient(ellipse at 20% 50%, #e65100 0%, transparent 55%),
            radial-gradient(ellipse at 80% 20%, #0f3460 0%, transparent 55%),
            radial-gradient(ellipse at 60% 80%, #1a237e 0%, transparent 45%),
            radial-gradient(ellipse at 40% 60%, #2d1b69 0%, transparent 40%), #07070d;
        }
        .glass-panel {
          background: linear-gradient(
            145deg,
            rgba(255, 250, 240, 0.97) 0%,
            rgba(255, 248, 235, 0.97) 50%,
            rgba(255, 245, 228, 0.97) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .glass-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            160deg,
            rgba(212, 165, 116, 0.35) 0%,
            rgba(212, 165, 116, 0.05) 40%,
            rgba(212, 165, 116, 0.3) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .form-input {
          background: #fffbf5;
          border: 2px solid rgba(212, 165, 116, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-input:hover {
          border-color: rgba(212, 165, 116, 0.45);
        }
        .form-input:focus {
          border-color: #e65100;
          box-shadow: 0 0 0 4px rgba(230, 81, 0, 0.08), 0 0 20px rgba(230, 81, 0, 0.05);
          outline: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #e65100 0%, #ff7b1c 100%);
          box-shadow: 0 4px 24px rgba(230, 81, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 8px 32px rgba(230, 81, 0, 0.45);
          transform: translateY(-2px);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 16px rgba(230, 81, 0, 0.3);
        }
        .orb {
          animation: orbFloat 12s ease-in-out infinite;
        }
        .orb:nth-child(2) {
          animation-duration: 16s;
          animation-delay: -4s;
        }
        .orb:nth-child(3) {
          animation-duration: 14s;
          animation-delay: -8s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(40px, -30px) scale(1.1); opacity: 0.25; }
          50% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.15; }
          75% { transform: translate(25px, -10px) scale(1.05); opacity: 0.22; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .page-enter {
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .status-enter {
          animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .input-shine {
          position: relative;
          overflow: hidden;
        }
        .input-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .input-shine:focus-within::after {
          left: 100%;
        }
        .grid-lines {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      {/* Left cinematic panel */}
      <div className="hidden lg:flex lg:w-[55%] auth-gradient relative items-center justify-center overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-30" />

        <div className="absolute inset-0">
          <div className="orb absolute w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, #e65100 0%, transparent 70%)", top: "5%", left: "0%" }} />
          <div className="orb absolute w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, #4a7c8e 0%, transparent 70%)", bottom: "10%", right: "5%" }} />
          <div className="orb absolute w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)", top: "50%", left: "40%" }} />
        </div>

        <div className="relative z-10 text-center px-12 max-w-xl page-enter">
          <div className="inline-flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl border border-white/15 flex items-center justify-center backdrop-blur-md bg-white/[0.04] shadow-lg">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FFB87A" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-widest text-white" style={{ fontFamily: "var(--font-cinzel), serif" }}>
              CHITH<span className="text-[#e65100]">RA</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight tracking-wide" style={{ fontFamily: "var(--font-cinzel), serif" }}>
            Reset Your
            <br />
            <span className="bg-gradient-to-r from-[#FFB87A] via-[#e65100] to-[#ff7b1c] bg-clip-text text-transparent">
              Password
            </span>
          </h1>

          <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
            Don&apos;t worry, it happens to the best of us. Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <div className="mt-12 flex items-center justify-center gap-10 text-white/80 text-xs">
            {[
              { icon: "shield", label: "Encrypted" },
              { icon: "lock", label: "Secure" },
              { icon: "check", label: "Verified" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5">
                {item.icon === "shield" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )}
                {item.icon === "lock" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {item.icon === "check" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-[#f5ebe0] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGExNzQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8 page-enter">
            <div className="inline-flex items-center gap-2.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
              </svg>
              <span className="text-xl font-bold tracking-wider text-[#3E2723]" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                CHITH<span className="text-[#e65100]">RA</span>
              </span>
            </div>
          </div>

          <div className="glass-panel relative rounded-3xl p-8 sm:p-10 shadow-2xl shadow-[#D4A574]/15 page-enter" style={{ animationDelay: "0.1s" }}>
            {sent ? (
              <div className="text-center py-8 status-enter">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10">
                  <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#3E2723] mb-3">Check Your Email</h2>
                <p className="text-sm text-[#6B4423] mb-1 leading-relaxed">If an account exists with</p>
                <p className="text-sm text-[#3E2723] font-semibold mb-4">{email}</p>
                <p className="text-sm text-[#6B4423] mb-8 leading-relaxed">
                  we&apos;ve sent a password reset link. Check your inbox and spam folder.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3.5 btn-primary text-white text-sm font-semibold rounded-xl text-center"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="block w-full mt-3 py-2 text-xs text-[#A0785A] hover:text-[#E65100] transition bg-transparent border-none cursor-pointer"
                >
                  Send to a different email
                </button>
              </div>
            ) : (
              <>
                {/* Back link */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-[#A0785A] hover:text-[#E65100] transition mb-6 group"
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Home
                </Link>

                {/* Header */}
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e65100]/15 to-[#ff7b1c]/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-[#E65100]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h2 className="font-cinzel text-2xl font-bold text-[#3E2723]">Forgot Password?</h2>
                  <p className="text-sm text-[#6B4423] mt-1.5">Enter your email and we&apos;ll send you a reset link</p>
                </div>

                {/* Error */}
                {error && (
                  <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 status-enter ${
                    cooldown > 0
                      ? "bg-amber-50/80 border-amber-200/50 text-amber-700"
                      : "bg-red-50/80 border-red-200/50 text-red-600"
                  }`}>
                    {cooldown > 0 ? (
                      <>
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Too many requests. Please wait <strong className="tabular-nums">{formatTime(cooldown)}</strong> before trying again.
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B4423] mb-2 ml-1">
                      Email
                    </label>
                    <div className="input-shine">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="form-input w-full rounded-xl px-4 py-3.5 text-sm text-[#3E2723] placeholder:text-[#A0785A]/60"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-3 btn-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="flex items-center justify-center gap-2.5">
                      {loading && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {loading ? "Sending..." : "Send Reset Link"}
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-[#D4A574]/12">
                  <p className="text-center text-xs text-[#6B4423]">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-[#E65100] hover:text-[#3E2723] transition">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
