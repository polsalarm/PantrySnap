import { motion, type HTMLMotionProps } from 'motion/react';

type MascotProps = {
  /** Display size in px (width & height). */
  size?: number;
  className?: string;
  alt?: string;
  /** Soft float bob — default on for hero placements. */
  bob?: boolean;
} & Omit<HTMLMotionProps<'img'>, 'src' | 'alt' | 'width' | 'height'>;

/**
 * Steve — the app logo / mascot.
 * Asset: /steve.png (knocked-out from repo-root steve.png via `npm run icons`).
 */
export default function Mascot({
  size = 96,
  className = '',
  alt = 'Steve',
  bob = true,
  ...rest
}: MascotProps) {
  return (
    <motion.img
      src="/steve.png"
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`object-contain select-none ${className}`}
      animate={
        bob
          ? {
              y: [0, -7, 0],
              scale: [1, 1.04, 1],
              rotate: [0, -2.5, 2.5, 0],
            }
          : undefined
      }
      transition={
        bob
          ? {
              duration: 4.2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.35, 0.7, 1],
            }
          : undefined
      }
      whileHover={bob ? { scale: 1.08, rotate: -4 } : undefined}
      {...rest}
    />
  );
}

/** Tiny Steve for chips / prop rows. */
export function MascotMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.img
      src="/steve.png"
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className}`}
      draggable={false}
      aria-hidden
      whileHover={{ scale: 1.15, rotate: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    />
  );
}
