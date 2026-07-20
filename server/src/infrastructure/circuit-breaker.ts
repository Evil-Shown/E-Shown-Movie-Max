import { cacheGetJson, cacheSetJson, redisKey } from "./redis";
import { logger } from "../config/logger";

type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
  /** Service name for logging and Redis keys */
  name: string;
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms to wait before trying again (half-open) */
  resetTimeoutMs: number;
  /** Time in ms to track failures (sliding window) */
  windowMs: number;
}

interface CircuitStateData {
  state: CircuitState;
  failures: number;
  lastFailureAt: number;
  openedAt: number;
}

/**
 * Distributed circuit breaker backed by Redis.
 *
 * When an external API (TMDB, OMDb) fails repeatedly, the circuit "opens"
 * and stops calling it for a cooldown period, serving stale cached data instead.
 * After the cooldown, it enters "half-open" and allows one test request.
 *
 * All state is stored in Redis so it works across multiple server instances.
 */
export class CircuitBreaker {
  private opts: CircuitBreakerOptions;

  constructor(opts: CircuitBreakerOptions) {
    this.opts = opts;
  }

  private get stateKey(): string {
    return redisKey("circuit", this.opts.name, "state");
  }

  private get failuresKey(): string {
    return redisKey("circuit", this.opts.name, "failures");
  }

  /** Check if the circuit allows a request through. */
  async isAllowed(): Promise<boolean> {
    const state = await this.getState();

    if (state.state === "closed") return true;

    if (state.state === "open") {
      const elapsed = Date.now() - state.openedAt;
      if (elapsed >= this.opts.resetTimeoutMs) {
        // Transition to half-open: allow one test request
        await this.setState({ ...state, state: "half-open" });
        logger.info({ circuit: this.opts.name }, "Circuit breaker: open -> half-open (allowing test request)");
        return true;
      }
      return false;
    }

    // half-open: allow the request
    return true;
  }

  /** Record a successful request. Closes the circuit if it was half-open. */
  async recordSuccess(): Promise<void> {
    const state = await this.getState();
    if (state.state !== "closed") {
      logger.info({ circuit: this.opts.name }, `Circuit breaker: ${state.state} -> closed (success)`);
      await this.setState({ state: "closed", failures: 0, lastFailureAt: 0, openedAt: 0 });
    }
    // Reset failure count on success
    await cacheSetJson(this.failuresKey, 0, Math.ceil(this.opts.windowMs / 1000));
  }

  /** Record a failure. Opens the circuit if threshold is exceeded. */
  async recordFailure(): Promise<void> {
    const state = await this.getState();
    const now = Date.now();

    // Count failure in sliding window
    let failures = state.failures;
    if (now - state.lastFailureAt > this.opts.windowMs) {
      failures = 0; // Reset if outside window
    }
    failures += 1;

    if (state.state === "half-open") {
      // Half-open failure -> re-open immediately
      logger.warn({ circuit: this.opts.name }, "Circuit breaker: half-open -> open (test request failed)");
      await this.setState({ state: "open", failures, lastFailureAt: now, openedAt: now });
      return;
    }

    if (failures >= this.opts.failureThreshold) {
      logger.warn(
        { circuit: this.opts.name, failures },
        `Circuit breaker: closed -> open (${failures} failures in ${this.opts.windowMs}ms window)`
      );
      await this.setState({ state: "open", failures, lastFailureAt: now, openedAt: now });
    } else {
      await this.setState({ state: state.state, failures, lastFailureAt: now, openedAt: state.openedAt });
    }
  }

  private async getState(): Promise<CircuitStateData> {
    const cached = await cacheGetJson<CircuitStateData>(this.stateKey);
    if (cached) return cached;
    return { state: "closed", failures: 0, lastFailureAt: 0, openedAt: 0 };
  }

  private async setState(state: CircuitStateData): Promise<void> {
    await cacheSetJson(this.stateKey, state, Math.ceil(this.opts.resetTimeoutMs / 1000) + 10);
    await cacheSetJson(this.failuresKey, state.failures, Math.ceil(this.opts.windowMs / 1000));
  }
}

/** TMDB circuit breaker: opens after 5 failures, resets after 30 seconds */
export const tmdbCircuit = new CircuitBreaker({
  name: "tmdb",
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  windowMs: 60_000,
});

/** OMDb circuit breaker: opens after 3 failures, resets after 60 seconds */
export const omdbCircuit = new CircuitBreaker({
  name: "omdb",
  failureThreshold: 3,
  resetTimeoutMs: 60_000,
  windowMs: 120_000,
});

/**
 * Execute a function with circuit breaker protection.
 * Returns the result if successful, or throws if the circuit is open.
 */
export async function withCircuitBreaker<T>(
  circuit: CircuitBreaker,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  const allowed = await circuit.isAllowed();

  if (!allowed) {
    if (fallback) {
      logger.warn({ circuit: "circuit" }, "Circuit open — using fallback");
      return fallback();
    }
    throw new Error(`Circuit breaker open — service temporarily unavailable`);
  }

  try {
    const result = await fn();
    await circuit.recordSuccess();
    return result;
  } catch (err) {
    await circuit.recordFailure();
    if (fallback) {
      logger.warn({ err }, "Circuit breaker: request failed — using fallback");
      return fallback();
    }
    throw err;
  }
}
