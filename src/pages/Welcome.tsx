import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PancakeIcon } from '../components/FoodIcons';
import Mascot, { MascotMark } from '../components/Mascot';
import { springSoft } from '../lib/motion';

gsap.registerPlugin(useGSAP);

export default function Welcome() {
  const navigate = useNavigate();
  const [freeDismissed, setFreeDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);

  const visible = !freeDismissed;

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

  function enterApp() {
    setFreeDismissed(true);
    navigate('/', { replace: true });
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
                <Prop icon={<PancakeIcon size={24} />} tint="bg-amber-100 border-amber-300" title="Food radar, no account">
                  Track fridge shelves, expiry countdowns, and recipe matches on this device.
                </Prop>
                <Prop icon={<MascotMark size={24} />} tint="bg-slate-100 border-slate-300" title="Steve watches your shelves">
                  Snap photos, generate recipes, and chat — all open without signing in.
                </Prop>
              </div>
            </div>

            <div className="text-center pb-safe">
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={springSoft}
                onClick={enterApp}
                className="btn-cheese px-6 py-3 rounded-2xl text-sm font-black shadow-md inline-flex items-center justify-center gap-2"
              >
                <MascotMark size={20} />
                <span>Start cooking</span>
              </motion.button>
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
