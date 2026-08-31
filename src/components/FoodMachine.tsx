import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DishIcon from './DishIcon';
import { DynamicFoodIcon } from './FoodIcons';
import './FoodMachine.css';

gsap.registerPlugin(useGSAP);

/** Machine chatter. Cycled while the request is in flight. */
const READOUT = [
  'SCANNING SHELVES',
  'CALIBRATING FLAVOUR',
  'SIMULATING SPICE',
  'ALIGNING INGREDIENTS',
  'PRESSURISING BROTH',
  'PLATING UP',
];

/**
 * The machine is shown immediately, but held for at least this long before it
 * dispenses. A recipe that lands in 400ms would otherwise flash the whole boot
 * and dispense sequence past the eye as a glitch.
 */
const MIN_RUN_MS = 1600;

export interface MachineDish {
  title: string;
  iconKey: string;
  /** Optional real image; the dish glyph is used when absent. */
  imageUrl?: string;
}

type Phase = 'off' | 'working' | 'dispense';

export default function FoodMachine({
  active,
  dish,
  feed = [],
  onRevealed,
}: {
  /** True while the generate request is in flight. */
  active: boolean;
  /** Set once the recipe lands — this is what triggers the dispense. */
  dish: MachineDish | null;
  /** Item names drawn up into the hopper, so the machine eats *your* food. */
  feed?: string[];
  /** Fires when the dispense finishes and the overlay has closed. */
  onRevealed: () => void;
}) {
  const [dispensing, setDispensing] = useState(false);
  const [line, setLine] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const revealed = useRef(onRevealed);
  useEffect(() => {
    revealed.current = onRevealed;
  });

  // Derived, not mirrored in state: the machine is up while the request is in
  // flight and stays up until it has handed the dish over. A failed request
  // drops both, so the caller's error message shows instead of a stalled
  // machine.
  const visible = active || dish !== null;
  const phase: Phase = !visible ? 'off' : dispensing ? 'dispense' : 'working';

  useEffect(() => {
    if (visible && startedAt.current === 0) startedAt.current = performance.now();
    if (!visible) startedAt.current = 0;
  }, [visible]);

  // Hold the machine for MIN_RUN_MS before it dispenses, measured from when it
  // appeared rather than from when the recipe landed.
  useEffect(() => {
    if (!dish || dispensing) return;
    const held = performance.now() - startedAt.current;
    const t = setTimeout(() => setDispensing(true), Math.max(0, MIN_RUN_MS - held));
    return () => clearTimeout(t);
  }, [dish, dispensing]);

  useEffect(() => {
    if (phase !== 'working') return;
    const t = setInterval(() => setLine((i) => (i + 1) % READOUT.length), 900);
    return () => clearInterval(t);
  }, [phase]);

  useGSAP(
    () => {
      if (phase === 'off' || !rootRef.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const q = gsap.utils.selector(rootRef);
      const rig = q('.fm-rig')[0];

      if (phase === 'working') {
        if (reduce) {
          gsap.set(rig, { y: 0, scale: 1, rotateX: 0, rotateY: 0, opacity: 1 });
          gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
          return;
        }

        const boot = gsap.timeline();
        boot
          .fromTo(
            rig,
            { y: -280, scale: 0.62, rotateZ: -16, opacity: 0 },
            { y: 0, scale: 1, rotateZ: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.5)' },
          )
          // Landing squash. Scale only — nothing here moves a sibling's box.
          .to('.fm-body', { scaleY: 0.86, scaleX: 1.1, duration: 0.09, ease: 'power2.out' })
          .to('.fm-body', { scaleY: 1.06, scaleX: 0.96, duration: 0.12, ease: 'power1.inOut' })
          .to('.fm-body', { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' })
          .fromTo(
            '.fm-leg',
            { scaleY: 0.2 },
            { scaleY: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(2.5)' },
            '<0.05',
          )
          // Explicit keyframes rather than repeat+yoyo: yoyo lands on whichever
          // end the parity of the repeat count happens to leave it on, and a
          // screen that boots to dark is not a flicker, it is a broken machine.
          .fromTo(
            '.fm-screen',
            { opacity: 0 },
            { keyframes: { opacity: [0, 1, 0, 1, 0.5, 1] }, duration: 0.42, ease: 'none' },
            '<',
          )
          .fromTo('.fm-shadow', { scaleX: 0.3, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.4 }, '<');

        // Idle sway. rotateY/rotateX against the stage perspective is what makes
        // the layered body read as an object rather than a sticker.
        gsap.to(rig, {
          rotateY: 9,
          rotateX: -4,
          duration: 2.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.7,
        });
        gsap.to(rig, {
          y: -7,
          duration: 1.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.85,
        });

        // Ingredients hoovered up into the hopper.
        const chips = q('.fm-chip');
        if (chips.length) {
          gsap.to(chips, {
            keyframes: [
              { opacity: 1, y: -10, z: 60, scale: 1, duration: 0.5, ease: 'power2.out' },
              { y: -96, z: -30, scale: 0.35, opacity: 0, duration: 0.75, ease: 'power2.in' },
            ],
            stagger: { each: 0.42, repeat: -1, repeatDelay: chips.length * 0.18 },
          });
        }
        return;
      }

      // phase === 'dispense'
      const done = () => {
        startedAt.current = 0;
        setDispensing(false);
        revealed.current();
      };

      if (reduce) {
        gsap.set('.fm-dish', { opacity: 1, scale: 1 });
        gsap.to(rootRef.current, { opacity: 0, duration: 0.3, delay: 0.9, onComplete: done });
        return;
      }

      const out = gsap.timeline({ onComplete: done });
      out
        .to(rig, { rotateY: 0, rotateX: 0, y: 0, duration: 0.2, ease: 'power2.out' })
        // Judder before it delivers.
        .to(rig, { x: 5, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' })
        .to('.fm-rig', { x: 0, duration: 0.05 })
        .to('.fm-hatch', { rotateX: 78, duration: 0.22, ease: 'back.out(2)' }, '-=0.15')
        .fromTo(
          '.fm-puff',
          { scale: 0.2, opacity: 0.9 },
          { scale: 2.4, opacity: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.05',
        )
        .fromTo(
          '.fm-dish',
          { opacity: 0, scale: 0.2, y: -6, z: -40, rotateZ: -140 },
          {
            opacity: 1,
            scale: 1,
            y: 44,
            z: 90,
            rotateZ: 0,
            duration: 0.75,
            ease: 'back.out(1.7)',
          },
          '-=0.42',
        )
        // Machine recoils from the delivery, then bows out.
        .to(rig, { rotateX: 12, y: 8, duration: 0.22, ease: 'power2.out' }, '-=0.6')
        .to(rig, { rotateX: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
        .to('.fm-dish', { scale: 1.12, duration: 0.22, ease: 'power2.out' }, '-=0.2')
        .to(rootRef.current, { opacity: 0, duration: 0.32, ease: 'power2.in' }, '+=0.25');
    },
    { dependencies: [phase], scope: rootRef },
  );

  if (phase === 'off') return null;

  const chips = feed.slice(0, 5);
  // Portalled out of the routed page: PageTransition puts a transform on it,
  // which would become the containing block for this fixed overlay and drag it
  // around with the page. .device-screen is the phone bezel's own containing
  // block (see index.css) — falling back to body covers the ?frame=off case.
  const mount = document.querySelector('.device-screen') ?? document.body;

  return createPortal(
    <div
      ref={rootRef}
      className="fm-scrim"
      role="status"
      aria-live="polite"
      aria-busy={phase === 'working'}
    >
      <div className="fm-stage">
        <div className="fm-scaler">
        <div className="fm-rig">
          <div className="fm-shadow" aria-hidden />

          <div className="fm-legs" aria-hidden>
            <div className="fm-leg fm-leg--b" />
            <div className="fm-leg fm-leg--l" />
            <div className="fm-leg fm-leg--r" />
          </div>

          <div className="fm-body" aria-hidden>
            <div className="fm-shell" />
            <div className="fm-stripes" />

            <div className="fm-lights">
              <i className="fm-led" />
              <i className="fm-led" />
              <i className="fm-led" />
              <i className="fm-led" />
              <i className="fm-led" />
            </div>

            <div className="fm-screen">
              <div className="fm-readout">{READOUT[line]}</div>
              <div className="fm-teeth">
                <i className="fm-tooth" />
                <i className="fm-tooth" />
                <i className="fm-tooth" />
                <i className="fm-tooth" />
                <i className="fm-tooth" />
                <i className="fm-tooth" />
                <i className="fm-tooth" />
              </div>
              <div className="fm-scan" />
            </div>

            <div className="fm-panel">
              <i className="fm-knob" style={{ background: 'var(--color-primary)' }} />
              <i className="fm-knob" style={{ background: 'var(--color-accent)' }} />
              <i className="fm-knob" style={{ background: 'var(--color-fresh)' }} />
              <span className="fm-bars">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
            </div>

            <div className="fm-gloss" />
            <div className="fm-hatch" />
          </div>

          <div className="fm-feed" aria-hidden>
            {chips.map((name, i) => (
              <div key={`${name}-${i}`} className="fm-chip" style={{ left: (i - 2) * 30 }}>
                <DynamicFoodIcon name={name} size={15} />
              </div>
            ))}
          </div>

          <div className="fm-puff" aria-hidden />

          <div className="fm-dish" aria-hidden>
            {dish?.imageUrl ? (
              <img src={dish.imageUrl} alt="" />
            ) : (
              <DishIcon iconKey={dish?.iconKey ?? 'chef-hat'} size={38} strokeWidth={1.75} />
            )}
          </div>
        </div>
        </div>

        <p className="fm-caption">
          {phase === 'dispense' && dish ? dish.title : 'Cooking up a recipe…'}
          <span>
            {phase === 'dispense'
              ? 'Order up!'
              : 'Steve is running your shelves through the machine'}
          </span>
        </p>
      </div>
    </div>,
    mount,
  );
}
