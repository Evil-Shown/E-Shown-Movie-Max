import crypto from "crypto";
import { logger } from "../../config/logger";

const MAX_PENDING_CLAIMS = 5;
const CLAIM_TTL_MS = 120_000;
const SESSION_TTL_MS = 30_000;

interface PendingSession {
  accessToken: string;
  user: Record<string, unknown>;
  expiresAt: number;
  expectedNonce: string;
  claimId: string;
}

const pending: PendingSession[] = [];

function purgeExpired(): void {
  const now = Date.now();
  while (pending.length > 0 && pending[0].expiresAt < now) {
    pending.shift();
  }
}

function generateNonce(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createPendingClaim(): { claimId: string; nonce: string } {
  purgeExpired();

  if (pending.length >= MAX_PENDING_CLAIMS) {
    logger.warn({ poolSize: pending.length }, "OAuth claim pool full - rejecting new claim");
    throw new Error("Too many pending claims. Try again.");
  }

  const nonce = generateNonce();
  const claimId = crypto.randomUUID();

  pending.push({
    accessToken: "",
    user: {},
    expiresAt: Date.now() + CLAIM_TTL_MS,
    expectedNonce: nonce,
    claimId,
  });

  return { claimId, nonce };
}

export function storeSession(data: { accessToken: string; user: Record<string, unknown> }, nonce: string): void {
  const idx = pending.findIndex((s) => s.expectedNonce === nonce);
  if (idx === -1) {
    throw new Error("Invalid or expired nonce");
  }

  pending[idx] = {
    ...pending[idx],
    ...data,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export function getPendingNonce(claimId: string): string | null {
  purgeExpired();
  const session = pending.find((s) => s.claimId === claimId);
  return session?.expectedNonce ?? null;
}

export function claimSession(nonce: string): PendingSession | null {
  purgeExpired();

  const idx = pending.findIndex((s) => s.expectedNonce === nonce);
  if (idx === -1) return null;

  const session = pending[idx];
  if (!session.accessToken) return null;

  pending.splice(idx, 1);
  return session;
}
