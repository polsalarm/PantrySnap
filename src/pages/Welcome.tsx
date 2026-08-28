import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cloudEnabled } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { PancakeIcon } from '../components/FoodIcons';
import Mascot, { MascotMark } from '../components/Mascot';
import { springSoft } from '../lib/motion';

gsap.registerPlugin(useGSAP);

type Mode = 'menu' | 'login' | 'signup';

async function sb() {
  const { getSupabase } = await import('../lib/supabase');
  return getSupabase();
}

export default function Welcome() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [freeDismissed, setFreeDismissed] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);

  const visible = auth.ready && !auth.signedIn && !freeDismissed;

  useGSAP(
    () => {
      if (!visible || !rootRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        logoRef.current,
        { y: 24, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55 },
      )
        .fromTo(
          titleRef.current,
          { y: 16, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.5 },
          '-=0.25',
        )
        .fromTo(
          propsRef.current?.children ?? [],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
          '-=0.2',
        );
    },
    { scope: rootRef, dependencies: [visible] },
  );

  if (!auth.ready) return null;

  function enterApp() {
    setFreeDismissed(true);
    navigate('/', { replace: true });
  }

  async function login() {
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await (await sb()).auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMsg(error.message);
      else enterApp();
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
      else enterApp();
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
      setMsg('Sign-in unavailable.');
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={rootRef}
          key="welcome"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: [0.4, 0, 1, 1] }}
          className="fixed inset-0 z-[100] bg-gradient-to-b from-sky-400 via-sky-200 to-sky-50 overflow-y-auto"
        >
          <div className="min-h-full max-w-md mx-auto px-6 py-8 sm:py-10 flex flex-col justify-between gap-6">
            <div className="text-center pt-2">
              <div ref={logoRef} className="relative mx-auto mb-2 w-36 h-36 flex items-center justify-center">
                <Mascot size={140} className="drop-shadow-[0_12px_16px_rgba(0,0,0,0.18)]" />
              </div>
              <h1
                ref={titleRef}
                className="text-4xl sm:text-5xl font-black text-ink tracking-tight leading-none drop-shadow-[0_3px_0_rgba(255,255,255,0.9)]"
              >
                PantrySnap
              </h1>
              <div className="mt-2 inline-block bg-white/90 border-2 border-sky-300 rounded-full px-3.5 py-1 shadow-xs">
                <p className="text-xs font-black text-sky-900 tracking-wide">
                  YOUR ATTENTIVE KITCHEN CLOUD
                </p>
              </div>
              <p className="text-sm font-extrabold text-slate-700 mt-2 leading-snug">
                Cloudy with a chance of delicious meals! Never let food go to waste.
              </p>
            </div>

            <div className="space-y-5">
              <div ref={propsRef} className="flex flex-col gap-3 text-left">
                <Prop icon={<PancakeIcon size={24} />} tint="bg-amber-100 border-amber-300" title="Free Food Radar (No Account)">
                  Track fridge shelves, expiry countdowns, and recipe matches offline directly on your device.
                </Prop>
                <Prop icon={<MascotMark size={24} />} tint="bg-slate-100 border-slate-300" title="Steve watches your shelves">
                  Snap food photos to auto-detect items, synthesize custom recipes, and chat with your kitchen buddy.
                </Prop>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border-3 border-white shadow-[0_8px_0_rgba(186,230,253,0.9),0_16px_28px_rgba(15,23,42,0.08)]">
                {!cloudEnabled ? (
                  <p className="text-sm font-bold text-slate-500 text-center">
                    Cloud sync is offline on this build — continue free below.
                  </p>
                ) : mode === 'menu' ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={google}
                      disabled={busy}
                      className="flex min-h-12 items-center justify-center gap-3 bg-white border-2 border-sky-200 text-slate-800 text-sm font-extrabold rounded-2xl py-3 disabled:opacity-60 shadow-[0_3px_0_#bae6fd] hover:border-sky-300 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                        G
                      </span>
                      Continue with Google
                    </button>
                    <button
                      onClick={() => setMode('signup')}
                      className="btn-meatball min-h-12 rounded-2xl py-3 text-sm font-black shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Sign up with email</span>
                    </button>
                    <button onClick={() => setMode('login')} className="text-red-600 font-extrabold py-1.5 text-sm hover:underline">
                      Already have an account? Log in
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex bg-sky-100 rounded-2xl p-1 text-sm font-extrabold border border-sky-200 relative">
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
                      className="min-h-11 bg-white border-2 border-sky-200 rounded-2xl px-4 py-2.5 text-sm font-bold outline-none focus:border-red-500 transition-colors"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      aria-label="Password"
                      className="min-h-11 bg-white border-2 border-sky-200 rounded-2xl px-4 py-2.5 text-sm font-bold outline-none focus:border-red-500 transition-colors"
                    />
                    <button
                      onClick={mode === 'login' ? login : signup}
                      disabled={busy || !email.trim() || !password}
                      className="btn-meatball min-h-12 rounded-2xl py-3 text-sm font-black disabled:opacity-60"
                    >
                      {busy ? 'Connecting…' : mode === 'login' ? 'Log in' : 'Create account'}
                    </button>
                    <button onClick={google} disabled={busy} className="text-xs font-bold text-slate-500 py-1 hover:text-slate-800">
                      or continue with Google
                    </button>
                  </div>
                )}
                {msg && <p className="text-xs font-bold text-center text-red-600 mt-2 bg-red-50 p-2 rounded-xl border border-red-200">{msg}</p>}
              </div>
            </div>

            <div className="text-center pb-safe">
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={springSoft}
                onClick={enterApp}
                className="btn-cheese px-6 py-3 rounded-2xl text-sm font-black shadow-md inline-flex items-center gap-2"
              >
                <MascotMark size={20} />
                <span>Start Free — No Account Needed</span>
              </motion.button>
              <p className="text-xs font-bold text-sky-900 mt-2">
                You can sync anytime from the Account tab.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Prop({
  icon,
  tint,
  title,
  children,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border-2 border-white shadow-[0_4px_0_rgba(186,230,253,0.7)]">
      <div className="flex items-center gap-2.5 text-slate-800 text-sm font-black leading-tight">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl border ${tint}`}>
          {icon}
        </span>
        {title}
      </div>
      <p className="text-xs font-bold text-slate-600 mt-1.5 leading-relaxed pl-12.5">{children}</p>
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
      className={`relative flex-1 rounded-full py-3 transition-colors z-10 ${
        active ? 'text-text' : 'text-text-muted'
      }`}
    >
      {active && (
        <motion.span
          layoutId="welcomeAuthTab"
          className="absolute inset-0 rounded-full bg-surface shadow-sm -z-10"
          transition={springSoft}
        />
      )}
      {children}
    </button>
  );
}
