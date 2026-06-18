import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloudEnabled, getSupabase } from '../lib/supabase';
import { syncNow } from '../lib/sync';
import Icon from '../components/Icon';

export default function Account() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cloudEnabled) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const sb = await getSupabase();
      const { data } = await sb.auth.getUser();
      setUserEmail(data.user?.email ?? null);
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        setUserEmail(session?.user?.email ?? null);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => unsub?.();
  }, []);

  async function sendLink() {
    setBusy(true);
    setStatus(null);
    try {
      const { error } = await (await getSupabase()).auth.signInWithOtp({ email: email.trim() });
      setStatus(error ? error.message : 'Magic link sent — check your email.');
    } finally {
      setBusy(false);
    }
  }

  async function doSync() {
    setBusy(true);
    setStatus('Syncing…');
    try {
      const { pulled, pushed } = await syncNow();
      setStatus(`Synced — pulled ${pulled}, pushed ${pushed}.`);
    } catch (e) {
      setStatus(`Sync failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await (await getSupabase()).auth.signOut();
    setUserEmail(null);
    setStatus('Signed out.');
  }

  return (
    <div>
      <header className="bg-bg flex items-center gap-2 w-full px-5 py-3 max-w-2xl mx-auto sticky top-0 z-40">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="text-text">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-semibold text-text">Account & Sync</h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28 flex flex-col gap-4">
        {!cloudEnabled ? (
          <div className="bg-surface rounded-2xl p-5 card-shadow text-center text-text-muted">
            <Icon name="cloud_off" className="text-3xl text-text-muted" />
            <p className="mt-2 font-medium text-text">Cloud sync not configured</p>
            <p className="text-sm mt-1">
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable
              multi-device sync. The app works fully offline without it.
            </p>
          </div>
        ) : userEmail ? (
          <>
            <div className="bg-surface rounded-2xl p-5 card-shadow">
              <p className="text-sm text-text-muted">Signed in as</p>
              <p className="font-semibold text-text">{userEmail}</p>
            </div>
            <button
              onClick={doSync}
              disabled={busy}
              className="flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl py-3 disabled:opacity-60"
            >
              <Icon name="sync" /> Sync now
            </button>
            <button onClick={signOut} disabled={busy} className="text-danger font-medium py-2">
              Sign out
            </button>
          </>
        ) : (
          <div className="bg-surface rounded-2xl p-5 card-shadow flex flex-col gap-3">
            <p className="text-text font-medium">Sign in to sync across devices</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="bg-bg border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={sendLink}
              disabled={busy || !email.trim()}
              className="bg-primary text-white font-semibold rounded-xl py-3 disabled:opacity-60"
            >
              Send magic link
            </button>
          </div>
        )}

        {status && <p className="text-sm text-text-muted text-center">{status}</p>}
      </main>
    </div>
  );
}
