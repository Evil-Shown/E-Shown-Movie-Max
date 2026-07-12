"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { migrateLocalStorageToBackend } from "@/lib/api/migrate";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  settings: {
    language: string;
    autoplay: boolean;
    preferredProvider: string | null;
    subtitleLang: string | null;
    quality: string | null;
    notifications: boolean;
  } | null;
  createdAt: string;
}

export interface PendingAction {
  type: "watch" | "watchlist" | "continue" | "gods-eye" | "live-tv" | "page";
  payload: Record<string, unknown>;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingAction: PendingAction | null;
  login: (email: string, password: string, deviceId?: string) => Promise<void>;
  register: (username: string, email: string, password: string, deviceId?: string) => Promise<void>;
  logout: () => Promise<void>;
  setPendingAction: (action: PendingAction | null) => void;
  consumePendingAction: () => PendingAction | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const TOKEN_KEY = "chithra-auth-token";
const USER_KEY = "chithra-auth-user";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function storeUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);

    // Listen for auth from OAuth callback (stored in another tab/window)
    const onAuthStored = () => {
      const t = getStoredToken();
      const u = getStoredUser();
      if (t && u) {
        setToken(t);
        setUser(u);
      }
    };
    window.addEventListener("auth-stored", onAuthStored);

    // Poll for OAuth sessions relayed from system browser (Electron desktop)
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const isElectron = typeof window !== "undefined" && (window as any).chithraDesktop?.isDesktopApp;
    if (isElectron && !getStoredToken()) {
      pollTimer = setInterval(async () => {
        try {
          const resp = await fetch("http://localhost:5000/api/v1/auth/claim-session");
          const json = await resp.json();
          if (json.success && json.data) {
            localStorage.setItem("chithra-auth-token", json.data.accessToken);
            localStorage.setItem("chithra-auth-user", JSON.stringify(json.data.user));
            setToken(json.data.accessToken);
            setUser(json.data.user);
          }
        } catch {
          /* server not ready */
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener("auth-stored", onAuthStored);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  const login = useCallback(async (email: string, password: string, deviceId?: string) => {
    const result = await api.post<{ user: AuthUser; tokens: { accessToken: string } }>("/api/v1/auth/login", {
      email,
      password,
      deviceId,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Login failed");
    }

    const { user: authUser, tokens } = result.data;
    setToken(tokens.accessToken);
    setUser(authUser);
    storeToken(tokens.accessToken);
    storeUser(authUser);

    // Migrate any localStorage data to backend on first login
    migrateLocalStorageToBackend(tokens.accessToken).catch(console.error);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, deviceId?: string) => {
    const result = await api.post<{ user: AuthUser; tokens: { accessToken: string } }>("/api/v1/auth/register", {
      username,
      email,
      password,
      deviceId,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Registration failed");
    }

    const { user: authUser, tokens } = result.data;
    setToken(tokens.accessToken);
    setUser(authUser);
    storeToken(tokens.accessToken);
    storeUser(authUser);

    // Migrate any localStorage data to backend on first login
    migrateLocalStorageToBackend(tokens.accessToken).catch(console.error);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await api.post("/api/v1/auth/logout", {}, token).catch(() => {});
    }
    setToken(null);
    setUser(null);
    clearAuth();
  }, [token]);

  const consumePendingAction = useCallback(() => {
    const action = pendingAction;
    setPendingAction(null);
    return action;
  }, [pendingAction]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      pendingAction,
      login,
      register,
      logout,
      setPendingAction,
      consumePendingAction,
    }),
    [user, token, isLoading, pendingAction, login, register, logout, consumePendingAction]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
