const STORAGE_KEY = "chithra-shuffle-state";

interface ShuffleState {
  count: number;
  lastAction: number;
  cooldownEndsAt: number;
}

const FREE_SHUFFLES = 3;
const COOLDOWN_BASE_MINUTES = 5;
const RESET_IDLE_MS = 30 * 60 * 1000;

function readState(): ShuffleState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShuffleState;
  } catch {
    return null;
  }
}

function writeState(state: ShuffleState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getOrCreateState(): ShuffleState {
  const existing = readState();
  const now = Date.now();
  if (existing) {
    const idle = now - existing.lastAction;
    if (idle > RESET_IDLE_MS) {
      const fresh: ShuffleState = { count: 0, lastAction: now, cooldownEndsAt: 0 };
      writeState(fresh);
      return fresh;
    }
    if (existing.cooldownEndsAt > 0 && now >= existing.cooldownEndsAt) {
      existing.cooldownEndsAt = 0;
      writeState(existing);
    }
    return existing;
  }
  const fresh: ShuffleState = { count: 0, lastAction: now, cooldownEndsAt: 0 };
  writeState(fresh);
  return fresh;
}

export interface ShuffleLimitInfo {
  shufflesLeft: number;
  cooldownMs: number;
  cooldownEndsAt: number;
  canShuffle: boolean;
  statusMessage: string;
}

export function getShuffleLimit(): ShuffleLimitInfo {
  const state = getOrCreateState();
  const now = Date.now();

  if (state.cooldownEndsAt > 0 && now < state.cooldownEndsAt) {
    const remaining = state.cooldownEndsAt - now;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return {
      shufflesLeft: 0,
      cooldownMs: remaining,
      cooldownEndsAt: state.cooldownEndsAt,
      canShuffle: false,
      statusMessage: `Wait ${minutes}:${String(seconds).padStart(2, "0")}`,
    };
  }

  const freeRemaining = Math.max(0, FREE_SHUFFLES - state.count);
  return {
    shufflesLeft: freeRemaining,
    cooldownMs: 0,
    cooldownEndsAt: 0,
    canShuffle: true,
    statusMessage: freeRemaining > 0 ? `${freeRemaining} shuffle${freeRemaining !== 1 ? "s" : ""} left` : "Shuffle",
  };
}

export function recordShuffle(): ShuffleLimitInfo {
  const state = getOrCreateState();
  const now = Date.now();
  state.lastAction = now;
  state.count += 1;

  if (state.count > FREE_SHUFFLES) {
    const cooldownIndex = state.count - FREE_SHUFFLES;
    const cooldownMinutes = cooldownIndex * COOLDOWN_BASE_MINUTES;
    state.cooldownEndsAt = now + cooldownMinutes * 60 * 1000;
  } else {
    state.cooldownEndsAt = 0;
  }

  writeState(state);
  return getShuffleLimit();
}
