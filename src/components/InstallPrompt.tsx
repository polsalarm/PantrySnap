import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { springSoft } from '../lib/motion';

const DISMISS_KEY = 'pantrysnap.installDismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Captures beforeinstallprompt and shows an animated install card. */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && deferred && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={springSoft}
          className="fixed left-4 right-4 bottom-24 z-[60] max-w-md mx-auto"
        >
          <div className="card-plate p-4 flex items-center gap-3 bg-white">
            <img src="/steve.png" alt="" className="size-12 object-contain" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-ink">Install PantrySnap</p>
              <p className="text-[11px] font-semibold text-ink-soft mt-0.5">
                Keep PantrySnap on your home screen for the full kitchen experience.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={install} className="btn-pill px-3 py-1.5 text-[11px]">
                Install
              </button>
              <button
                onClick={dismiss}
                className="text-[10px] font-bold text-ink-soft hover:text-ink"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
