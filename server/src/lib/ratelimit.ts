// Per-user fixed-window rate limiter (in-memory). Guards the paid AI endpoints.
// Swap for a shared store (Redis/Upstash) when running multiple instances.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.AI_RATE_LIMIT_PER_MIN) || 20;

const hits = new Map<string, { count: number; resetAt: number }>();

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRate(userId: string): RateResult {
  const now = Date.now();
  const entry = hits.get(userId);

  if (!entry || entry.resetAt <= now) {
    hits.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_PER_WINDOW - 1, retryAfterSec: 0 };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { ok: true, remaining: MAX_PER_WINDOW - entry.count, retryAfterSec: 0 };
}
