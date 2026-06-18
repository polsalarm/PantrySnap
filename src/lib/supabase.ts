// Supabase client (Phase 8 cloud sync). Env-gated AND lazily loaded: the
// `cloudEnabled` flag is SDK-free (just env), and the heavy @supabase SDK is
// dynamically imported only on first real use — keeping it out of the main bundle.
import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (!cloudEnabled) throw new Error('Cloud disabled: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY');
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(url!, anonKey!);
  }
  return client;
}
