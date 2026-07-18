export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Platform": getPlatform(),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();
  return data;
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
