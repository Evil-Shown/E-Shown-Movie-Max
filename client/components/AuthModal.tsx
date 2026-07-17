"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

const cinemaGradients = [
  "radial-gradient(ellipse at 20% 50%, #e65100 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f3460 0%, transparent 50%), #0a0a0f",
  "radial-gradient(ellipse at 80% 50%, #c62828 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, #1a237e 0%, transparent 50%), #0a0a0f",
  "radial-gradient(ellipse at 30% 30%, #bf360c 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #263238 0%, transparent 50%), #0a0a0f",
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: (authenticated?: boolean) => void;
  redirectOnClose?: boolean;
}

export default function AuthModal({ isOpen, onClose, redirectOnClose = false }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gradientIndex] = useState(() => Math.floor(Math.random() * cinemaGradients.length));
  const modalRef = useRef<HTMLDivElement>(null);
  const didAuth = useRef(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleClose = useCallback(() => {
    if (didAuth.current) {
      // Auth succeeded ΓÇö replay pending action
      onClose(true);
    } else {
      // Dismissed without login ΓÇö only redirect home if not already there
      if (redirectOnClose && typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
      onClose(false);
    }
  }, [redirectOnClose, onClose]);

  useEffect(() => {
    if (isOpen) {
      didAuth.current = false;
      const t = setTimeout(() => setMounted(true), 50);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [handleClose]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await login(loginForm.email, loginForm.password);
      didAuth.current = true;
      setSuccessMsg("Welcome back! You're signed in.");
      setTimeout(() => onClose(true), 800);
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
    setSuccessMsg(null);
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      didAuth.current = true;
      setSuccessMsg("Account created! Welcome to Chithra.");
      setTimeout(() => onClose(true), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-xl transition-all duration-700"
        style={{ background: cinemaGradients[gradientIndex] }}
        onClick={handleClose}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #e65100 0%, transparent 70%)",
            top: "-10%",
            left: "-15%",
            animationDuration: "8s",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-pulse"
          style={{
            background: "radial-gradient(circle, #4a7c8e 0%, transparent 70%)",
            bottom: "-10%",
            right: "-10%",
            animationDuration: "12s",
          }}
        />
      </div>

      <div
        ref={modalRef}
        className={`relative z-10 w-full max-w-[440px] transition-all duration-500 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-[#e65100]/40 rotate-45"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a]/90 via-[#1a1a2e]/85 to-[#16213e]/90" />

          <div className="relative px-6 py-8 max-h-[90vh] overflow-y-auto">
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ color: "#e65100" }}
                >
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
                  <path d="M4 22h16" strokeWidth="1.5" opacity="0.3" />
                </svg>
                <span
                  className="text-xl font-bold tracking-wider text-white"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  CHITH<span style={{ color: "#e65100" }}>RA</span>
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#FFB87A]/70 font-semibold">CINEMA</p>
            </div>

            {/* Tabs */}
            <div className="relative flex mb-6 bg-white/5 rounded-xl p-1">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-[#e65100] transition-all duration-300 ease-out"
                style={{ left: mode === "login" ? "4px" : "calc(50%)" }}
              />
              <button
                onClick={() => switchMode("login")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 rounded-lg ${mode === "login" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 rounded-lg ${mode === "register" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                Register
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2.5 animate-pulse">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {mode === "login" ? (
              <>
                <form key="login" onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
                  <InputGroup
                    icon={<EmailIcon />}
                    label="Email"
                    type="email"
                    value={loginForm.email}
                    onChange={(v) => setLoginForm((f) => ({ ...f, email: v }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <InputGroup
                    icon={<LockIcon />}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(v) => setLoginForm((f) => ({ ...f, password: v }))}
                    placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                    autoComplete="current-password"
                    trailing={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
                  />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#e65100] cursor-pointer" /> Remember me
                    </label>
                    <button type="button" className="text-[#FFB87A] hover:text-[#e65100] transition-colors font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <SubmitButton loading={loading} text="Sign In" loadingText="Signing in..." />
                </form>
                <GoogleOAuthButton />
              </>
            ) : (
              <>
                <form key="register" onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-4">
                  <InputGroup
                    icon={<UserIcon />}
                    label="Username"
                    type="text"
                    value={registerForm.username}
                    onChange={(v) => setRegisterForm((f) => ({ ...f, username: v }))}
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                  <InputGroup
                    icon={<EmailIcon />}
                    label="Email"
                    type="email"
                    value={registerForm.email}
                    onChange={(v) => setRegisterForm((f) => ({ ...f, email: v }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <InputGroup
                    icon={<LockIcon />}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(v) => setRegisterForm((f) => ({ ...f, password: v }))}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    trailing={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
                  />
                  <InputGroup
                    icon={<ShieldIcon />}
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={(v) => setRegisterForm((f) => ({ ...f, confirmPassword: v }))}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    trailing={
                      <EyeToggle
                        shown={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                  <SubmitButton loading={loading} text="Create Account" loadingText="Creating account..." />
                </form>
                <GoogleOAuthButton />
              </>
            )}

            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-center text-sm text-gray-400">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => switchMode("register")}
                      className="text-[#FFB87A] hover:text-[#e65100] underline underline-offset-4 font-medium transition-colors"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      className="text-[#FFB87A] hover:text-[#e65100] underline underline-offset-4 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, text, loadingText }: { loading: boolean; text: string; loadingText: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full py-3 mt-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#e65100] to-[#ff7b1c] text-white font-semibold text-sm uppercase tracking-wider shadow-lg shadow-[#e65100]/25 transition-all hover:shadow-xl hover:shadow-[#e65100]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
    >
      <span className="relative z-10">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {loadingText}
          </span>
        ) : (
          text
        )}
      </span>
    </button>
  );
}

function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="text-gray-500 hover:text-gray-300 transition-colors">
      {shown ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

function InputGroup({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 ml-1">
        {label}
      </label>
      <div
        className={`group relative flex items-center h-[46px] rounded-xl border bg-white/[0.03] transition-all duration-200
          ${focused ? "border-[#e65100] shadow-[0_0_0_3px_rgba(230,81,0,0.15)]" : "border-white/10 hover:border-white/25"}
        `}
      >
        <span
          className={`flex items-center justify-center shrink-0 w-10 h-11 transition-colors duration-200 ${focused ? "text-[#e65100]" : "text-gray-500"}`}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          style={{ outline: "none" }}
          className="flex-1 h-11 pl-3 pr-0 bg-transparent text-[15px] text-white placeholder-gray-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 font-sans [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:[transition-delay:9999s] [&:-webkit-autofill]:shadow-[0_0_0_1000px_transparent_inset]"
        />
        {trailing && <span className="flex items-center justify-center shrink-0 w-10 h-11">{trailing}</span>}
      </div>
      <style jsx global>{`
        input[type="password"]::-ms-reveal {
          display: none;
        }
      `}</style>
    </div>
  );
}

function GoogleOAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const redirectTo = `${window.location.origin}/auth/callback`;
      const url = `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&prompt=select_account`;

      const isElectron = (window as Window & typeof globalThis).chithraDesktop?.isDesktopApp;

      if (isElectron) {
        const desktop = (window as Window & typeof globalThis).chithraDesktop!;
        const opened = await desktop.openExternal!(url);
        if (!opened) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = url;
          return;
        }
        startPolling();
      } else {
        const popup = window.open(url, "google-auth", "width=600,height=700");
        if (!popup) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = url;
          return;
        }
        pollPopupToken(popup);
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      setLoading(false);
    }
  };

  const pollPopupToken = (popup: Window) => {
    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          setLoading(false);
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl?.startsWith(window.location.origin + "/auth/callback")) {
          clearInterval(timer);
          const hash = popupUrl.includes("#") ? popupUrl.substring(popupUrl.indexOf("#") + 1) : "";
          const token = new URLSearchParams(hash).get("access_token");
          if (token) {
            popup.close();
            finalizeOAuth(token);
          } else {
            setLoading(false);
          }
        }
      } catch {
        /* cross-origin */
      }
    }, 300);
  };

  const startPolling = () => {
    const poll = async () => {
      try {
        const resp = await fetch("http://localhost:5000/api/v1/auth/claim-session");
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
      setTimeout(startPolling, 1500);
    };
    poll();
    setLoading(false);
  };

  const finalizeOAuth = async (accessToken: string) => {
    try {
      const { api } = await import("@/lib/api");
      const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
        "/api/v1/auth/oauth",
        { accessToken }
      );
      if (result.success && result.data) {
        const { user, tokens } = result.data;
        localStorage.setItem("chithra-auth-token", tokens.accessToken);
        localStorage.setItem("chithra-auth-user", JSON.stringify(user));
        window.dispatchEvent(new Event("auth-stored"));
        window.location.reload();
      }
    } catch (err) {
      console.error("OAuth finalize error:", err);
    }
    setLoading(false);
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
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
      </button>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}
