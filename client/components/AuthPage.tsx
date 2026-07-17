"use client";

import Link from "next/link";
import { useState } from "react";

interface AuthPageProps {
  defaultMode?: "login" | "register";
}

export default function AuthPage({ defaultMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const updateRegister = (field: keyof typeof registerForm, value: string) => {
    setRegisterForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="min-h-screen flex font-sans text-[#3E2723]">
      <style jsx>{`
        .auth-bg {
          background-image: url("/auth/people-cinema-watching-movie_23-2151005483.jpg");
          background-size: cover;
          background-position: center;
        }
        .form-input {
          background: #fffbf5;
          border: 1px solid rgba(212, 165, 116, 0.4);
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #e65100;
          outline: none;
          box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.08);
        }
        .auth-tab {
          transition: all 0.3s ease;
        }
        .auth-tab.active {
          color: #e65100;
        }
        .auth-tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e65100;
          border-radius: 2px;
        }
        .form-panel {
          animation: fadeIn 0.35s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Left Side - Cinematic Image */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 auth-bg relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3E2723]/90 via-[#3E2723]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-transparent to-[#3E2723]/30" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 xl:p-16">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-cinzel text-2xl font-bold text-[#FFFBF5]">CHITHIRA</span>
            </Link>
          </div>
          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#FFB87A] font-semibold mb-3">
              The God&apos;s Eye Observes
            </p>
            <h2 className="font-cinzel text-4xl xl:text-5xl font-bold text-[#FFFBF5] leading-tight mb-4">
              Every Story,
              <br />
              <span className="text-[#FFB87A]">Carved in Light</span>
            </h2>
            <p className="text-[#D4A574] text-base leading-relaxed">
              Step into a world where cinema meets obsession. Your personal theater of curated films, series, and live
              channels awaits.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#D4A574]">
            <span>CHITHIRA Cinema</span>
            <span className="w-1 h-1 rounded-full bg-[#E65100]" />
            <span>Premium Streaming</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 min-h-screen flex items-center justify-center p-6 md:p-12 bg-[#FAF3E8] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E65100]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4A7C8E]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Decorative floating card */}
          <div className="hidden xl:block absolute -top-6 -right-20 w-40 bg-[#FFFBF5] border border-[#D4A574]/30 rounded-2xl p-2 shadow-xl rotate-3 hover:rotate-0 transition duration-500">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img src="/auth/Blog-10.jpg" alt="Cinema" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/70 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[9px] uppercase tracking-wider text-[#FFB87A] font-semibold">Now Streaming</p>
                <p className="text-[10px] text-[#FFFBF5] font-semibold truncate">Unlimited Cinema</p>
              </div>
            </div>
          </div>

          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-cinzel text-2xl font-bold text-[#3E2723]">CHITHIRA</span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E65100] font-semibold mt-1">
              The God&apos;s Eye Observes
            </p>
          </div>

          <div className="bg-[#FFFBF5] border border-[#D4A574]/30 rounded-3xl p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex items-center relative border-b border-[#D4A574]/30 mb-8">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`auth-tab relative flex-1 pb-3 text-sm font-semibold uppercase tracking-wider ${mode === "login" ? "active" : "text-[#A0785A] hover:text-[#6B4423]"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`auth-tab relative flex-1 pb-3 text-sm font-semibold uppercase tracking-wider ${mode === "register" ? "active" : "text-[#A0785A] hover:text-[#6B4423]"}`}
              >
                Create Account
              </button>
            </div>

            {mode === "login" ? (
              <form key="login" onSubmit={handleLoginSubmit} className="form-panel space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[#6B4423]">
                    <input type="checkbox" className="accent-[#E65100]" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-[#E65100] hover:text-[#3E2723] transition">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#E65100] hover:bg-[#FF7B1C] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="text-center text-xs text-[#6B4423]">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-semibold text-[#E65100] hover:text-[#3E2723] transition"
                  >
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form key="register" onSubmit={handleRegisterSubmit} className="form-panel space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => updateRegister("username", e.target.value)}
                    placeholder="Choose a username"
                    className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => updateRegister("email", e.target.value)}
                    placeholder="you@example.com"
                    className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={registerForm.mobile}
                    onChange={(e) => updateRegister("mobile", e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => updateRegister("password", e.target.value)}
                      placeholder="Create a password"
                      className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      Confirm
                    </label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateRegister("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-[#6B4423]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-[#E65100]"
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="#" className="text-[#E65100] hover:text-[#3E2723] transition">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#E65100] hover:text-[#3E2723] transition">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="w-full py-3 bg-[#E65100] hover:bg-[#FF7B1C] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center text-xs text-[#6B4423]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-semibold text-[#E65100] hover:text-[#3E2723] transition"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-[#A0785A]">
            Backend authentication is coming soon. This is a preview of the auth experience.
          </p>
        </div>
      </div>
    </div>
  );
}
