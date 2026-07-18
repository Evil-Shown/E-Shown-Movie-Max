import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 12_000;

async function request<T>(path: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Platform": "mobile",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(`Request failed: ${path}`, response.status);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(`Request timed out: ${path}`);
    }
    throw new ApiError(`Network error: ${path}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function apiGet<T>(path: string, timeoutMs?: number): Promise<T> {
  return request<T>(path, { method: "GET" }, timeoutMs);
}

export function apiPost<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) }, timeoutMs);
}
