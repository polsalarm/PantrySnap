import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const KEY = 'pantrysnap.onboarded';

// Full-screen first-run hero. Explains the two ways to use PantrySnap:
// free/local (no account) vs signed-in (AI + cross-device sync).
export default function Welcome() {
  const navigate = useNavigate();
  const [done, setDone] = useState(() => localStorage.getItem(KEY) === '1');
  if (done) return null;

  function finish(go?: string) {
    localStorage.setItem(KEY, '1');
    setDone(true);
    if (go) navigate(go);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg overflow-y-auto">
      <div className="min-h-full max-w-2xl mx-auto px-6 py-10 flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in">
          <div className="text-6xl mb-4">🥫</div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">PantrySnap</h1>
          <p className="text-lg font-semibold text-text mt-3">Organize. Track. Never waste again.</p>
          <p className="text-text-muted mt-2 max-w-sm">
            Snap your shelves, track what's expiring, and cook with what you already have.
          </p>

          {/* Two paths */}
          <div className="w-full flex flex-col gap-3 mt-8 text-left">
            <div className="bg-surface rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-2 text-text font-semibold">
                <Icon name="bolt" className="text-primary" /> Use it free — no account
              </div>
              <p className="text-sm text-text-muted mt-1">
                Add items, track quantity & expiry, get alerts, browse recipes. Works fully offline,
                data stays on your device.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-2 text-text font-semibold">
                <Icon name="auto_awesome" className="text-accent" /> Sign in — unlock AI & sync
              </div>
              <p className="text-sm text-text-muted mt-1">
                Snap a photo to auto-add items, generate recipes from what's expiring, chat with your
                kitchen assistant, and sync across devices.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={() => finish()}
            className="bg-primary text-white font-semibold rounded-xl py-3.5"
          >
            Start free
          </button>
          <button
            onClick={() => finish('/account')}
            className="flex items-center justify-center gap-2 bg-surface border border-border text-text font-semibold rounded-xl py-3.5"
          >
            <Icon name="login" /> Sign in for AI & sync
          </button>
          <p className="text-xs text-text-muted text-center">
            You can sign in anytime later from the Account tab.
          </p>
        </div>
      </div>
    </div>
  );
}
