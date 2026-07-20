"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  if (score === 0) return { label: "", color: "", width: 0 };
  if (score <= 30) return { label: "Weak", color: "#ef4444", width: 25 };
  if (score <= 50) return { label: "Fair", color: "#f97316", width: 50 };
  if (score <= 70) return { label: "Good", color: "#eab308", width: 75 };
  return { label: "Strong", color: "#22c55e", width: 100 };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
      } else {
        setTokenError(true);
      }
    } else {
      setTokenError(true);
    }
  }, []);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post("/api/v1/auth/reset-password", { token, password });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(result.error?.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
        .strength-bar {
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.06) !important;
        }
        .input-valid {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.06) !important;
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
            Create a
            <br />
            <span className="bg-gradient-to-r from-[#FFB87A] via-[#e65100] to-[#ff7b1c] bg-clip-text text-transparent">
              New Password
            </span>
          </h1>

          <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
            Choose a strong password to secure your account. A mix of letters, numbers, and symbols is best.
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
            {tokenError ? (
              <div className="text-center py-8 status-enter">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-500/10">
                  <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#3E2723] mb-3">Invalid Reset Link</h2>
                <p className="text-sm text-[#3E2723] mb-8 leading-relaxed max-w-xs mx-auto">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-block w-full py-3.5 btn-primary text-black text-sm font-semibold rounded-xl text-center"
                >
                  Request New Link
                </Link>
                <Link href="/" className="block mt-4 text-xs text-[#6B4423] hover:text-[#E65100] transition text-center">
                  Back to Home
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-8 status-enter">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10">
                  <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#3E2723] mb-3">Password Reset!</h2>
                <p className="text-sm text-[#3E2723] mb-1">Your password has been updated successfully.</p>
                <p className="text-xs text-[#6B4423] mb-8">Redirecting to sign in...</p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3.5 btn-primary text-white text-sm font-semibold rounded-xl text-center"
                >
                  Sign In Now
                </Link>
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
                  <h2 className="font-cinzel text-2xl font-bold text-[#3E2723]">Reset Password</h2>
                  <p className="text-sm text-[#6B4423] mt-1.5">Enter your new password below</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm flex items-center gap-3 status-enter">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B4423] mb-2 ml-1">
                      New Password
                    </label>
                    <div className="input-shine relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter new password"
                        className={`form-input w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-[#3E2723] placeholder:text-[#A0785A]/60 ${
                          focusedField === "password" ? "ring-1 ring-[#e65100]/10" : ""
                        }`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0785A] hover:text-[#6B4423] transition p-1"
                      >
                        {showPassword ? (
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="h-1.5 bg-[#D4A574]/15 rounded-full overflow-hidden">
                          <div
                            className="strength-bar h-full rounded-full transition-all duration-500"
                            style={{ width: `${strength.width}%`, background: strength.color, opacity: strength.width > 0 ? 1 : 0 }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: strength.color || "#A0785A" }}>
                            {strength.label && <>Password strength: <strong>{strength.label}</strong></>}
                          </p>
                          <div className="flex gap-1.5">
                            {["upper", "lower", "number", "symbol"].map((check) => {
                              const ok =
                                (check === "upper" && /[A-Z]/.test(password)) ||
                                (check === "lower" && /[a-z]/.test(password)) ||
                                (check === "number" && /\d/.test(password)) ||
                                (check === "symbol" && /[^a-zA-Z0-9]/.test(password));
                              return (
                                <div
                                  key={check}
                                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                    ok ? "bg-green-500" : "bg-[#D4A574]/20"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B4423] mb-2 ml-1">
                      Confirm Password
                    </label>
                    <div className="input-shine relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Repeat your password"
                        className={`form-input w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-[#3E2723] placeholder:text-[#A0785A]/60 ${
                          passwordsMatch ? "input-valid" : passwordsMismatch ? "input-error" : ""
                        } ${focusedField === "confirm" ? "ring-1 ring-[#e65100]/10" : ""}`}
                        required
                        minLength={6}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <svg className="w-4.5 h-4.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : passwordsMismatch ? (
                          <svg className="w-4.5 h-4.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </span>
                    </div>
                    {passwordsMismatch && (
                      <p className="mt-1.5 text-xs text-red-500 ml-1 animate-pulse">Passwords do not match</p>
                    )}
                    {passwordsMatch && (
                      <p className="mt-1.5 text-xs text-green-600 ml-1">Passwords match</p>
                    )}
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
                      {loading ? "Resetting..." : "Reset Password"}
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
