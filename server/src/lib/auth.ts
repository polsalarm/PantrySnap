// Supabase token verification for protecting AI endpoints (cost + abuse control).
// Verifies the user's access token against Supabase's /auth/v1/user endpoint and
// caches the result briefly. Enforced only when Supabase is configured on the server.
import { cached } from './cache.js';

const url = process.env.SUPABASE_URL?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

// When Supabase is configured, AI endpoints require a valid user token.
export const authRequired = Boolean(url && anonKey);

export interface AuthUser {
  id: string;
  email?: string;
}

export async function verifyToken(token: string | undefined): Promise<AuthUser | null> {
  if (!authRequired) return { id: 'anonymous' }; // dev: no Supabase => no gate
  if (!token) return null;

  // Cache by token for 60s to avoid hitting Supabase on every AI call.
  return cached(`auth:${token.slice(-24)}`, 60_000, async () => {
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
}

/** Extract a Bearer token from the Authorization header. */
export function bearer(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  return m?.[1];
}
