import { resolveApiBase } from "./api-base";

/** Live API base — call at request time (hostname-aware on the client). */
export function getApiBase(): string {
  return resolveApiBase();
}

/** Snapshot at module load; prefer getApiBase() / resolveApiBase() in new code. */
export const API_BASE = resolveApiBase();

function getPlatform(): "web" | "desktop" | "mobile" {
  if (typeof window !== "undefined" && window.chithraDesktop?.isDesktopApp) {
    return "desktop";
  }
  return "web";
}

interface ApiOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

let didLogApiBase = false;

function logApiBaseOnce(): void {
  if (didLogApiBase || typeof window === "undefined") return;
  didLogApiBase = true;
  const base = resolveApiBase();
  console.info(
    `[chithra-api] base=${base || "(same-origin → /api/v1 proxied to Render)"}`,
    `| host=${window.location.host}`,
    `| env=${process.env.NEXT_PUBLIC_API_BASE_URL || "(unset)"}`
  );
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  logApiBaseOnce();

  const { token, ...fetchOptions } = options;
  const base = resolveApiBase();
  const url = `${base}${path}`;
  const method = (fetchOptions.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Platform": getPlatform(),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { success: false, error: { code: "NON_JSON", message: await response.text() } };

    if (!response.ok) {
      console.warn(`[chithra-api] ${method} ${url} → ${response.status}`, data?.error || data);
    }

    return data as ApiResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error(`[chithra-api] ${method} ${url} FAILED: ${message}`, {
      tip:
        url.includes("localhost") &&
        typeof window !== "undefined" &&
        !["localhost", "127.0.0.1"].includes(window.location.hostname)
          ? "Production site is still calling localhost. Redeploy Vercel after this fix (same-origin /api/v1 proxy)."
          : "Check Render is awake (free tier sleeps). Open /api/v1/health on the API host.",
    });
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Cannot reach API at ${url}: ${message}`,
      },
    };
  }
}

export const api = {
  get: <T>(path: string, token?: string) => apiRequest<T>(path, { method: "GET", token }),

  post: <T>(path: string, body?: unknown, token?: string) =>
    apiRequest<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      token,
    }),

  patch: <T>(path: string, body?: unknown, token?: string) =>
    apiRequest<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      token,
    }),

  delete: <T>(path: string, token?: string) => apiRequest<T>(path, { method: "DELETE", token }),
};
