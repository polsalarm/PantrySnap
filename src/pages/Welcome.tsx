import { useState } from 'react';
import { cloudEnabled } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import Icon from '../components/Icon';

type Mode = 'menu' | 'login' | 'signup';

// Dynamically import Supabase so the SDK stays out of the initial bundle.
async function sb() {
  const { getSupabase } = await import('../lib/supabase');
  return getSupabase();
}

// First-run / signed-out hero. Shows every launch until the user signs in.
// "Start free" dismisses for the current session (data persists in IndexedDB).
export default function Welcome() {
  const auth = useAuth();
  const [freeDismissed, setFreeDismissed] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Hide once signed in, after they choose "Start free", or until auth state is known.
  if (!auth.ready) return null;
  if (auth.signedIn || freeDismissed) return null;

  async function login() {
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await (await sb()).auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMsg(error.message);
    } catch {
      setMsg('Login unavailable right now.');
    } finally {
      setBusy(false);
    }
  }

  async function signup() {
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } = await (await sb()).auth.signUp({ email: email.trim(), password });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg('Account created — check your email to confirm, then log in.');
    } catch {
      setMsg('Sign up unavailable right now.');
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setMsg(null);
    try {
      await (await sb()).auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    } catch {
      setMsg('Google sign-in unavailable.');
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg overflow-y-auto">
      <div className="min-h-full max-w-md mx-auto px-7 py-8 sm:py-10 flex flex-col justify-between gap-8">
        {/* Hero */}
        <div className="text-center animate-in pt-4">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-[1.75rem] bg-primary text-white shadow-[0_16px_40px_rgba(22,69,37,0.18)] ring-8 ring-primary-soft/25">
            <Icon name="inventory_2" className="text-[2.75rem]" filled />
          </div>
          <h1 className="text-5xl font-extrabold text-primary tracking-[-0.05em] leading-none">PantrySnap</h1>
          <p className="text-lg font-semibold text-text mt-4 leading-relaxed">
            Organize. Track. Never waste again.
          </p>
        </div>

        <div className="space-y-7">
          {/* Value props */}
          <div className="flex flex-col gap-4 text-left">
            <Prop icon="offline_bolt" tint="text-primary" title="Free, no account">
              Track items, expiry alerts, and recipes. Works offline, with data stored on your device.
            </Prop>
            <Prop icon="auto_awesome" tint="text-accent" title="Sign in for AI & sync">
              Snap to auto-add food, get AI recipes, chat with your kitchen, and sync across devices.
            </Prop>
          </div>

          {/* Auth */}
          <div>
            {!cloudEnabled ? (
              <p className="text-base leading-relaxed text-text-muted text-center">
                Cloud sign-in isn't configured on this build — continue free below.
              </p>
            ) : mode === 'menu' ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={google}
                  disabled={busy}
                  className="flex min-h-14 items-center justify-center gap-3 bg-surface border border-border text-text text-base font-bold rounded-2xl py-4 disabled:opacity-60 card-shadow"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-bg text-sm font-extrabold text-accent">
                    G
                  </span>
                  Continue with Google
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className="min-h-14 bg-primary text-white text-base font-bold rounded-2xl py-4 shadow-[0_14px_28px_rgba(22,69,37,0.22)]"
                >
                  Sign up with email
                </button>
                <button onClick={() => setMode('login')} className="text-primary font-bold py-2 text-base">
                  Already have an account? Log in
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex bg-border-soft rounded-full p-1.5 text-base font-bold">
                  <Tab active={mode === 'login'} onClick={() => setMode('login')}>
                    Log in
                  </Tab>
                  <Tab active={mode === 'signup'} onClick={() => setMode('signup')}>
                    Sign up
                  </Tab>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email"
                  className="min-h-14 bg-surface border border-border rounded-2xl px-5 py-4 text-base outline-none focus:border-primary"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  aria-label="Password"
                  className="min-h-14 bg-surface border border-border rounded-2xl px-5 py-4 text-base outline-none focus:border-primary"
                />
                <button
                  onClick={mode === 'login' ? login : signup}
                  disabled={busy || !email.trim() || !password}
                  className="min-h-14 bg-primary text-white text-base font-bold rounded-2xl py-4 disabled:opacity-60"
                >
                  {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
                <button onClick={google} disabled={busy} className="text-base font-semibold text-text-muted py-2">
                  or continue with Google
                </button>
              </div>
            )}
            {msg && <p className="text-base leading-relaxed text-center text-accent-dark mt-4">{msg}</p>}
          </div>
        </div>

        {/* Free path */}
        <div className="text-center pb-safe">
          <button onClick={() => setFreeDismissed(true)} className="text-text text-base font-extrabold underline">
            Start free — no account
          </button>
          <p className="text-sm leading-relaxed text-text-muted mt-2">
            You can sign in anytime from the Account tab.
          </p>
        </div>
      </div>
    </div>
  );
}

function Prop({
  icon,
  tint,
  title,
  children,
}: {
  icon: string;
  tint: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-[1.35rem] p-5 card-shadow border border-border/60">
      <div className="flex items-center gap-3 text-text text-lg font-extrabold leading-tight">
        <span className={`grid size-10 shrink-0 place-items-center rounded-2xl bg-bg ${tint}`}>
          <Icon name={icon} className="text-[1.65rem]" filled />
        </span>
        {title}
      </div>
      <p className="text-base leading-relaxed text-text-muted mt-3">{children}</p>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-3 transition-colors ${
        active ? 'bg-surface text-text shadow-sm' : 'text-text-muted'
      }`}
    >
      {children}
    </button>
  );
}
