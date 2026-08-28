// Optional Supabase identity. Used only to bucket rate limits when a token
// is present — guests still get AI. Never returns 401 for a missing session.
import { cached } from './cache.js';

const url = process.env.SUPABASE_URL?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

export const authRequired = false;

export interface AuthUser {
  id: string;
  email?: string;
}

export async function verifyToken(token: string | undefined): Promise<AuthUser> {
  if (!token || !url || !anonKey) return { id: 'anonymous' };

  const user = await cached(`auth:${token.slice(-24)}`, 60_000, async () => {
    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: anonKey!, Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      const u = (await res.json()) as { id?: string; email?: string };
      return u.id ? { id: u.id, email: u.email } : null;
    } catch {
      return null;
    }
  });
  return user ?? { id: 'anonymous' };
}

/** Extract a Bearer token from the Authorization header. */
export function bearer(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  return m?.[1];
}
