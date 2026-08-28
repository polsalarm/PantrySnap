import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { pageVariantsFor } from '../lib/motion';

/** Wrap each routed page for enter/exit choreography. */
export default function PageTransition({
  children,
  direction = 1,
}: {
  children: ReactNode;
  /** +1 = forward in nav, -1 = back */
  direction?: number;
}) {
  const variants = pageVariantsFor(direction);
  // h-full (not just min-h-full) so this box has a *definite* height — pages
  // like Chat that rely on an h-full flex column to pin content to the
  // bottom need a real height to fill, not just a content-based floor.
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full min-h-full w-full will-change-transform"
    >
      {children}
    </motion.div>
  );
}
