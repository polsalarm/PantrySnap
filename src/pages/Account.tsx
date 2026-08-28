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
      <header className="bg-sky-100/90 backdrop-blur-md flex items-center gap-2.5 w-full px-5 py-3.5 max-w-2xl mx-auto sticky top-0 z-40 border-b-2 border-white shadow-xs">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="grid size-9 place-items-center bg-white border-2 border-sky-200 rounded-xl text-slate-800 hover:border-red-400 shadow-2xs transition-all active:scale-95">
          <Icon name="arrow_back" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-tight">FLDSMDFR Sync & Lab</h1>
          <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider">Multi-Device Food Cloud</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4 pb-28 flex flex-col gap-4">
        {!cloudEnabled ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-white shadow-[0_6px_0_rgba(186,230,253,0.7)] text-center text-slate-600">
            <span className="text-4xl inline-block mb-2 animate-bob">📡</span>
            <p className="mt-1 font-black text-slate-800 text-base">FLDSMDFR Cloud Sync Offline</p>
            <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable multi-device sync. The food radar and storage work 100% offline without it!
            </p>
          </div>
        ) : userEmail ? (
          <>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-[0_6px_0_rgba(186,230,253,0.7)]">
              <span className="text-xs font-black text-sky-800 uppercase tracking-wider">Signed in as</span>
              <p className="text-base font-black text-slate-800 mt-0.5">{userEmail}</p>
            </div>
            <button
              onClick={doSync}
              disabled={busy}
              className="btn-meatball flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black disabled:opacity-60 shadow-md"
            >
              <Icon name="sync" className={busy ? 'animate-spin' : ''} />
              <span>{busy ? 'Syncing with FLDSMDFR…' : 'Sync Pantry Radar Now'}</span>
            </button>
            <button onClick={signOut} disabled={busy} className="text-red-600 font-black text-xs py-2 hover:underline text-center">
              Sign out from this device
            </button>
          </>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-[0_6px_0_rgba(186,230,253,0.7)] flex flex-col gap-3.5">
            <div>
              <p className="text-base font-black text-slate-800">Connect to FLDSMDFR Cloud</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">Optional — the app works without this. Sign in only if you want fridge sync across devices.</p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="bg-sky-50/80 border-2 border-sky-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-red-500 transition-colors"
            />
            <button
              onClick={sendLink}
              disabled={busy || !email.trim()}
              className="btn-meatball rounded-2xl py-3.5 text-sm font-black disabled:opacity-60 shadow-md"
            >
              {busy ? 'Sending…' : 'Send Magic Link'}
            </button>
          </div>
        )}

        {status && <p className="text-sm text-text-muted text-center">{status}</p>}
      </main>
    </div>
  );
}
