import { useEffect, useState } from 'react';
import { cloudEnabled } from './supabase';

export interface AuthState {
  ready: boolean;
  signedIn: boolean;
  email: string | null;
}

// Reactive Supabase auth state. Optional — the app is fully usable as a guest.
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    ready: !cloudEnabled,
    signedIn: false,
    email: null,
  });

  useEffect(() => {
    if (!cloudEnabled) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const { getSupabase } = await import('./supabase');
      const sb = await getSupabase();
      const { data } = await sb.auth.getSession();
      setState({
        ready: true,
        signedIn: Boolean(data.session),
        email: data.session?.user.email ?? null,
      });
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        setState({
          ready: true,
          signedIn: Boolean(session),
          email: session?.user.email ?? null,
        });
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => unsub?.();
  }, []);

  return state;
}
