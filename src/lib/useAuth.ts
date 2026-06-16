import { useEffect, useState } from 'react';
import { cloudEnabled } from './supabase';

export interface AuthState {
  ready: boolean;
  signedIn: boolean;
  email: string | null;
  /** AI requires sign-in only when cloud/auth is configured. */
  aiRequiresSignIn: boolean;
}

// Reactive Supabase auth state. Supabase SDK is dynamically imported so it
// stays out of the main bundle; falls back to "open" when cloud isn't configured.
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    ready: !cloudEnabled,
    signedIn: false,
    email: null,
    aiRequiresSignIn: cloudEnabled,
  });

  useEffect(() => {
    if (!cloudEnabled) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const { supabase } = await import('./supabase');
      const sb = supabase();
      const { data } = await sb.auth.getSession();
      setState({
        ready: true,
        signedIn: Boolean(data.session),
        email: data.session?.user.email ?? null,
        aiRequiresSignIn: true,
      });
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        setState({
          ready: true,
          signedIn: Boolean(session),
          email: session?.user.email ?? null,
          aiRequiresSignIn: true,
        });
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => unsub?.();
  }, []);

  return state;
}
