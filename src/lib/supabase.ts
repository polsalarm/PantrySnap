// Supabase client (Phase 8 cloud sync). Env-gated: cloud features are inert
// unless VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set. The app stays
// fully local-first; cloud is opt-in backup/sync on top of IndexedDB.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cloudEnabled) throw new Error('Cloud disabled: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY');
  if (!client) client = createClient(url!, anonKey!);
  return client;
}
