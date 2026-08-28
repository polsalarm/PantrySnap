import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from './Icon';
import { springSoft } from '../lib/motion';

export default function TopBar({
  title,
  account = true,
}: {
  title: string;
  account?: boolean;
  /** Retained for call-site compatibility; the weather ticker was removed. */
  showWeather?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSoft}
      className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md"
    >
      <header className="flex items-center justify-between w-full px-5 pt-4 pb-3 max-w-2xl mx-auto">
        <h1 className="text-base font-bold text-text tracking-tight leading-none">{title}</h1>
        {account && (
          <Link
            to="/account"
            aria-label="Account and sync"
            className="grid size-9 place-items-center rounded-full bg-surface text-text-muted hover:text-text shadow-[0_2px_8px_rgba(30,41,59,0.06)] transition-colors"
          >
            <Icon name="cloud_sync" className="text-lg" />
          </Link>
        )}
      </header>
    </motion.div>
  );
}
