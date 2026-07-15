"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: (authenticated?: boolean) => void;
  redirectOnClose?: boolean;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FFFBF5] rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFFBF5]/10 backdrop-blur-sm border border-[#FFFBF5]/20 flex items-center justify-center hover:bg-[#FFFBF5]/20 hover:scale-110 transition-all z-10"
        >
          <svg
            className="w-4 h-4 text-[#FFFBF5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("register")} onDone={onClose} />
        ) : (
          <RegisterForm onSwitch={() => setMode("login")} onDone={onClose} />
        )}

        <div className="px-8 pb-8">
          <GoogleOAuthButton onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch, onDone }: { onSwitch: () => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
        "/api/v1/auth/login",
        { email, password }
      );
      if (result.success && result.data) {
        localStorage.setItem("chithra-auth-token", result.data.tokens.accessToken);
        localStorage.setItem("chithra-auth-user", JSON.stringify(result.data.user));
        window.dispatchEvent(new Event("auth-stored"));
        onDone();
      } else {
        setError(result.error?.message || "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Welcome back</h2>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#3E2723]/70 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3E2723]/20 bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3E2723]/70 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3E2723]/20 bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 bg-gradient-to-r from-[#D4A574] to-[#FFB87A] text-[#3E2723] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,165,116,0.3)] transition-all disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p className="mt-4 text-center text-sm text-[#3E2723]/50">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-[#D4A574] font-semibold hover:underline">
          Register
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch, onDone }: { onSwitch: () => void; onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
        "/api/v1/auth/register",
        { username, email, password }
      );
      if (result.success && result.data) {
        localStorage.setItem("chithra-auth-token", result.data.tokens.accessToken);
        localStorage.setItem("chithra-auth-user", JSON.stringify(result.data.user));
        window.dispatchEvent(new Event("auth-stored"));
        onDone();
      } else {
        setError(result.error?.message || "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Create account</h2>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#3E2723]/70 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3E2723]/20 bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            required
            minLength={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3E2723]/70 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3E2723]/20 bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3E2723]/70 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3E2723]/20 bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            required
            minLength={6}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 bg-gradient-to-r from-[#D4A574] to-[#FFB87A] text-[#3E2723] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,165,116,0.3)] transition-all disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
      <p className="mt-4 text-center text-sm text-[#3E2723]/50">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-[#D4A574] font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

function GoogleOAuthButton({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    if (!claimId || !nonce) return;
    const poll = async () => {
      try {
        const resp = await fetch("http://localhost:5000/api/v1/auth/claim-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nonce }),
        });
        const json = await resp.json();
        if (json.success && json.data) {
          localStorage.setItem("chithra-auth-token", json.data.accessToken);
          localStorage.setItem("chithra-auth-user", JSON.stringify(json.data.user));
          window.dispatchEvent(new Event("auth-stored"));
          window.location.reload();
          return;
        }
      } catch {
        /* server not ready */
      }
      setTimeout(poll, 1500);
    };
    poll();
    setLoading(false);
  }, [claimId, nonce]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isElectron = (window as Window & typeof globalThis).chithraDesktop?.isDesktopApp;

      if (isElectron) {
        const claimResp = await fetch("http://localhost:5000/api/v1/auth/create-claim", {
          method: "POST",
        });
        const claimJson = await claimResp.json();
        if (!claimJson.success || !claimJson.data) {
          setLoading(false);
          return;
        }
        setClaimId(claimJson.data.claimId);
        setNonce(claimJson.data.nonce);

        const redirectTo = `${window.location.origin}/auth/callback`;
        const url = `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&state=${claimJson.data.claimId}&prompt=select_account`;

        const opened = await (window as Window & typeof globalThis).chithraDesktop!.openExternal(url);
        if (!opened) {
          window.location.href = url;
          return;
        }
      } else {
        // Browser: redirect directly to Supabase OAuth
        const redirectTo = `${window.location.origin}/auth/callback`;
        const url = `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&prompt=select_account`;
        window.location.href = url;
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">or continue with</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </button>
    </div>
  );
}
