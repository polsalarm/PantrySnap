import { motion } from 'motion/react';

export default function QtyBar({ pct, lowThreshold }: { pct: number; lowThreshold: number }) {
  const isLow = pct <= lowThreshold;
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-border-soft overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isLow ? 'bg-accent' : 'bg-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        />
      </div>
      <span className="text-xs text-text-muted">{pct}% left</span>
    </div>
  );
}
