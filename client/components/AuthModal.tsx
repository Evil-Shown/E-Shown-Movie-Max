"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(loginForm.email, loginForm.password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-[#0f3460]/30 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "login" ? "bg-[#e94560] text-white" : "bg-[#0f3460]/50 text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "register" ? "bg-[#e94560] text-white" : "bg-[#0f3460]/50 text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#e94560] hover:bg-[#e94560]/90 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f3460]/50 border border-[#0f3460] text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#e94560] hover:bg-[#e94560]/90 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-400">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setMode("register")} className="text-[#e94560] hover:underline font-medium">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-[#e94560] hover:underline font-medium">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
