import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * Screen hole inside public/mockup-frame.{avif,png} (cropped from mockup.avif).
 * Percentages are relative to the frame image.
 */
const SCREEN = {
  left: '6.397%',
  top: '1.88%',
  width: '88.552%',
  height: '96.068%',
} as const;

function frameDisabled(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('frame') === 'off';
  } catch {
    return false;
  }
}

/**
 * Always-on phone bezel using mockup.avif artwork (Dynamic Island removed).
 * Screen layer uses transform: translateZ(0) so fixed nav/FABs stay inside.
 * Escape hatch: `?frame=off`.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const off = frameDisabled();

  useGSAP(
    () => {
      if (off || !deviceRef.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set([deviceRef.current, screenRef.current, frameRef.current], {
          clearProps: 'all',
          opacity: 1,
        });
        return;
      }

      const blobs = rootRef.current?.querySelectorAll('.phone-blob');
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (blobs?.length) {
        gsap.set(blobs, { scale: 0.55, opacity: 0 });
        tl.to(
          blobs,
          {
            scale: 1,
            opacity: (i: number) => (i === 2 ? 0.35 : 0.55),
            duration: 1,
            stagger: 0.14,
            ease: 'power2.out',
          },
          0,
        );
      }

      tl.fromTo(
        deviceRef.current,
        { y: 64, scale: 0.86, opacity: 0, rotate: -3.2 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.95,
          ease: 'power4.out',
        },
        0.1,
      )
        .fromTo(
          screenRef.current,
          { opacity: 0, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.45',
        )
        .fromTo(
          frameRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.45 },
          '-=0.4',
        );
    },
    { scope: rootRef },
  );

  if (off) {
    return <div className="min-h-dvh w-full">{children}</div>;
  }

  return (
    <div
      ref={rootRef}
      className="phone-stage min-h-dvh w-full flex items-center justify-center p-3 sm:p-6 relative overflow-hidden"
    >
      <div className="phone-blob phone-blob-a" aria-hidden />
      <div className="phone-blob phone-blob-b" aria-hidden />
      <div className="phone-blob phone-blob-c" aria-hidden />

      <div
        ref={deviceRef}
        className="phone-device relative z-10"
        style={{
          height: 'min(874px, calc(100dvh - 2rem))',
          width: 'min(452px, calc((100dvh - 2rem) * 0.5077), calc(100vw - 1rem))',
          aspectRatio: '297 / 585',
        }}
      >
        <div
          ref={screenRef}
          className="device-screen absolute overflow-hidden bg-bg"
          style={{
            left: SCREEN.left,
            top: SCREEN.top,
            width: SCREEN.width,
            height: SCREEN.height,
            borderRadius: '11% / 5.5%',
          }}
        >
          <div className="device-screen-inner absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-y-contain">
            {children}
          </div>
        </div>

        <picture>
          <source srcSet="/mockup-frame.avif" type="image/avif" />
          <img
            ref={frameRef}
            src="/mockup-frame.png"
            alt=""
            draggable={false}
            className="phone-frame-img absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-20"
            aria-hidden
          />
        </picture>
      </div>
    </div>
  );
}
