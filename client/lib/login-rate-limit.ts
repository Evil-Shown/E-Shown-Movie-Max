const STORAGE_KEY = "chithra-login-attempts";

interface LoginRateState {
  failures: number;
  lastAttempt: number;
  cooldownUntil: number;
}

const MAX_ATTEMPTS = 3;
const RESET_IDLE_MS = 30 * 60 * 1000;

const COOLDOWN_SECONDS = [0, 30, 60, 120, 300, 600];

function readState(): LoginRateState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoginRateState;
  } catch {
    return null;
  }
}

function writeState(state: LoginRateState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getLoginRateState() {
  const existing = readState();
  const now = Date.now();

  if (!existing) {
    return { canAttempt: true, failures: 0, waitSeconds: 0 };
  }

  if (now - existing.lastAttempt > RESET_IDLE_MS) {
    clearLoginRateState();
    return { canAttempt: true, failures: 0, waitSeconds: 0 };
  }

  if (existing.cooldownUntil > 0) {
    if (now >= existing.cooldownUntil) {
      existing.cooldownUntil = 0;
      writeState(existing);
      return { canAttempt: true, failures: existing.failures, waitSeconds: 0 };
    }
    const remaining = Math.ceil((existing.cooldownUntil - now) / 1000);
    return { canAttempt: false, failures: existing.failures, waitSeconds: remaining };
  }

  return { canAttempt: true, failures: existing.failures, waitSeconds: 0 };
}

export function recordLoginFailure() {
  const existing = readState();
  const now = Date.now();
  const failures = (existing?.failures ?? 0) + 1;
  const cooldownIdx = Math.min(failures, COOLDOWN_SECONDS.length - 1);
  const wait = COOLDOWN_SECONDS[cooldownIdx];
  const cooldownUntil = wait > 0 ? now + wait * 1000 : 0;

  writeState({ failures, lastAttempt: now, cooldownUntil });
}

export function clearLoginRateState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
