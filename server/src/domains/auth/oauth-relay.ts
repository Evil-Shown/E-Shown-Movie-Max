// In-memory relay for OAuth sessions between system browser and Electron app
interface PendingSession {
  accessToken: string;
  user: Record<string, unknown>;
  expiresAt: number;
}

const pending: PendingSession[] = [];

export function storeSession(data: { accessToken: string; user: Record<string, unknown> }) {
  pending.push({
    ...data,
    expiresAt: Date.now() + 30_000, // 30s to claim
  });
  // Keep only the last 5
  while (pending.length > 5) pending.shift();
}

export function claimSession(): PendingSession | null {
  // Clean expired
  const now = Date.now();
  while (pending.length > 0 && pending[0].expiresAt < now) pending.shift();
  return pending.shift() || null;
}
