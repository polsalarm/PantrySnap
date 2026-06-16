// Minimal in-memory TTL cache. Cuts repeat calls to external APIs.
// Swap for KV/Redis when the deploy host is chosen (Phase 5, step 6).

type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export const TTL = {
  product: 1000 * 60 * 60 * 24, // 24h — product data is stable
  recipes: 1000 * 60 * 60 * 6, // 6h
};
