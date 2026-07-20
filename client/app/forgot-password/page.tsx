"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getPublicAppOrigin } from "@/lib/app-origin";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(resetError.message || "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.1);
          outline: none;
        }
        .form-panel {
          background: linear-gradient(135deg, rgba(255, 250, 240, 0.97) 0%, rgba(255, 245, 230, 0.97) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 auth-bg relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 max-w-lg">
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4 leading-tight">
            Reset Your
            <br />
            <span className="text-[#FFB87A]">Password</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Don&apos;t worry, it happens to the best of us. Enter your email and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-[#f5ebe0]">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[#6B4423] hover:text-[#E65100] transition mb-8"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <div className="form-panel rounded-2xl p-8 border border-[#D4A574]/30 shadow-lg">
            {sent ? (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46, 125, 50, 0.12)" }}
                >
                  <svg className="w-8 h-8 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#3E2723] mb-2">Check Your Email</h2>
                <p className="text-sm text-[#6B4423] mb-6 leading-relaxed">
                  If an account exists with <strong className="text-[#3E2723]">{email}</strong>, we&apos;ve sent a password
                  reset link. Check your inbox and spam folder.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 bg-[#E65100] hover:bg-[#FF7B1C] text-white text-sm font-semibold rounded-xl transition text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div
                    className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(230, 81, 0, 0.12)" }}
                  >
                    <svg className="w-7 h-7 text-[#E65100]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h2 className="font-cinzel text-xl font-bold text-[#3E2723]">Forgot Password?</h2>
                  <p className="text-xs text-[#6B4423] mt-1">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="form-input w-full rounded-xl px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#E65100] hover:bg-[#FF7B1C] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <p className="text-center text-xs text-[#6B4423] mt-5">
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-[#E65100] hover:text-[#3E2723] transition">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
