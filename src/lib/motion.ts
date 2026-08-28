/** Shared motion tokens — keep page choreography consistent and fluid. */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;

export const springSoft = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
  mass: 0.85,
} as const;

export const springSnappy = {
  type: 'spring',
  stiffness: 520,
  damping: 26,
  mass: 0.55,
} as const;

export const springBouncy = {
  type: 'spring',
  stiffness: 420,
  damping: 18,
  mass: 0.7,
} as const;

export const springLayout = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.7,
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springSoft,
  },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.92, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSoft,
  },
};

export const fadeSlide = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: springSoft },
};

export const staggerGrid = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.06,
    },
  },
};

export const staggerFast = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

export const staggerText = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const pressable = {
  whileTap: { scale: 0.94 },
  whileHover: { y: -2, scale: 1.01 },
  transition: springSnappy,
};

/** Primary nav order — used for directional page slides. */
export const NAV_ORDER = ['/', '/fridge', '/profile'] as const;

export function navIndex(path: string): number {
  const exact = NAV_ORDER.indexOf(path as (typeof NAV_ORDER)[number]);
  if (exact >= 0) return exact;
  if (path.startsWith('/fridge') || path.startsWith('/shelf')) return 1;
  if (
    path.startsWith('/profile') ||
    path.startsWith('/account') ||
    path.startsWith('/chat') ||
    path.startsWith('/alerts') ||
    path.startsWith('/items')
  ) {
    return 2;
  }
  return 0;
}

export function pageVariantsFor(direction: number) {
  const xIn = direction >= 0 ? 32 : -32;
  const xOut = direction >= 0 ? -20 : 20;
  return {
    initial: { opacity: 0, x: xIn, scale: 0.978 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        ...springSoft,
        opacity: { duration: 0.26, ease: easeOut },
      },
    },
    exit: {
      opacity: 0,
      x: xOut,
      scale: 0.988,
      transition: { duration: 0.16, ease: easeIn },
    },
  };
}

/** Fallback non-directional variants (deep links / unknown). */
export const pageVariants = pageVariantsFor(1);
