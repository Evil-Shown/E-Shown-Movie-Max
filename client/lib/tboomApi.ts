export type TboomErrorCode =
  | "TIMEOUT"
  | "NO_RESULTS"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PARSE_ERROR";

export type TboomApiError = {
  success: false;
  errorCode: TboomErrorCode;
  message: string;
  retryable: boolean;
};

export type SearchApiResponse = {
  results: unknown[];
  meta?: { providersUsed?: string[]; providersFailed?: string[] };
};

const BASE_URL =
  process.env.NEXT_PUBLIC_GODS_EYE_API_URL ??
  process.env.NEXT_PUBLIC_TBOOM_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000";

const TIMEOUT_MS = 12000;
const RETRY_DELAYS = [500, 1000, 2000];
const inFlight = new Map<string, Promise<unknown>>();

function mapHttpToError(status: number, bodyMessage?: string): TboomApiError {
  if (status === 429) {
    return {
      success: false,
      errorCode: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment and try again.",
      retryable: true
    };
  }
  if (status >= 500) {
    return {
      success: false,
      errorCode: "NETWORK_ERROR",
      message: bodyMessage || "Search service is temporarily unavailable.",
      retryable: true
    };
  }
  return {
    success: false,
    errorCode: "NO_RESULTS",
    message: bodyMessage || "Search failed. Try different keywords.",
    retryable: false
  };
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const started = Date.now();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {})
      }
    });
    const elapsed = Date.now() - started;
    if (elapsed > 3000) {
      console.warn(`[godsEyeApi] Slow response (${elapsed}ms): ${url}`);
    }
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw {
        success: false,
        errorCode: "TIMEOUT" as const,
        message: "Search timed out. Check your connection and try again.",
        retryable: true
      } satisfies TboomApiError;
    }
    throw {
      success: false,
      errorCode: "NETWORK_ERROR" as const,
      message: "Unable to connect to search service.",
      retryable: true
    } satisfies TboomApiError;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: TboomApiError | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await fetchWithTimeout(url, init);

      if (!response.ok) {
        let bodyMessage = "";
        try {
          const body = await response.json();
          bodyMessage = body?.error || body?.message || "";
        } catch {
          /* ignore */
        }
        const mapped = mapHttpToError(response.status, bodyMessage);
        if (!mapped.retryable || attempt === RETRY_DELAYS.length) {
          throw mapped;
        }
        lastError = mapped;
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        continue;
      }

      try {
        return (await response.json()) as T;
      } catch {
        throw {
          success: false,
          errorCode: "PARSE_ERROR",
          message: "Received an invalid response from the search service.",
          retryable: false
        } satisfies TboomApiError;
      }
    } catch (err) {
      if (err && typeof err === "object" && "errorCode" in err) {
        const apiErr = err as TboomApiError;
        if (!apiErr.retryable || attempt === RETRY_DELAYS.length) throw apiErr;
        lastError = apiErr;
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        continue;
      }
      throw err;
    }
  }

  throw (
    lastError ?? {
      success: false,
      errorCode: "NETWORK_ERROR",
      message: "Search failed after multiple attempts.",
      retryable: true
    }
  );
}

function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export async function tboomSearch(
  query: string,
  limit = 30
): Promise<SearchApiResponse | TboomApiError> {
  const key = `search:${query}:${limit}`;
  return dedupe(key, async () => {
    const url = `${BASE_URL}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    return fetchWithRetry<SearchApiResponse | TorrentResult[]>(url);
  });
}

type TorrentResult = Record<string, unknown>;

export async function tboomSuggest(q: string): Promise<string[]> {
  if (q.length < 2) return [];
  const url = `${BASE_URL}/api/search/suggest?q=${encodeURIComponent(q)}`;
  const data = await fetchWithRetry<string[]>(url);
  return Array.isArray(data) ? data.slice(0, 6) : [];
}

export async function tboomTrending(): Promise<Array<{ query: string; count: number }>> {
  const url = `${BASE_URL}/api/search/trending`;
  const data = await fetchWithRetry<Array<{ query: string; count: number }>>(url);
  return Array.isArray(data) ? data : [];
}

export async function tboomResolveMagnet(payload: {
  name?: string;
  magnet?: string;
  providerHint?: string;
}): Promise<{ magnet?: string; error?: string } | TboomApiError> {
  const url = `${BASE_URL}/api/search/resolve-magnet`;
  return fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function isTboomError(value: unknown): value is TboomApiError {
  return Boolean(value && typeof value === "object" && "success" in value && (value as TboomApiError).success === false);
}

export function normalizeSearchPayload(
  data: SearchApiResponse | TorrentResult[] | TboomApiError
): SearchApiResponse | TboomApiError {
  if (isTboomError(data)) return data;
  if (Array.isArray(data)) {
    return { results: data, meta: { providersUsed: [], providersFailed: [] } };
  }
  return data;
}
