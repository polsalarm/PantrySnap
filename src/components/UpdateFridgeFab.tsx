import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { springBouncy } from '../lib/motion';

/**
 * Lives next to BottomNav in AppShell — not inside a routed page.
 * Page transitions apply a transform, which would otherwise become the
 * containing block for position:fixed and make this scroll away with the page.
 */
export default function UpdateFridgeFab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, x: '-50%', scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      transition={{ ...springBouncy, delay: 0.2 }}
      // Tracks BottomNav, which now also clears the home indicator.
      style={{ bottom: 'calc(104px + env(safe-area-inset-bottom))' }}
      className="fixed left-1/2 z-40"
    >
      <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ y: 1, scale: 0.96 }}>
        <Link
          to="/items/new"
          className="btn-pill flex items-center gap-2 px-[22px] py-[13px] text-sm whitespace-nowrap border-2 border-white shadow-[4px_4px_0_var(--color-ink)]"
        >
          <Plus size={15} strokeWidth={2.5} />
          Update fridge stock
        </Link>
      </motion.div>
    </motion.div>
  );
}
