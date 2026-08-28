import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { House, Refrigerator, ChefHat } from 'lucide-react';
import { springBouncy, springLayout, springSnappy } from '../lib/motion';

const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(255,255,255,0.5)';

// Same Lucide icons used elsewhere on-screen — Refrigerator matches
// FridgeHome's empty state, ChefHat matches Profile's own hero avatar — so
// the nav echoes the page it points to instead of a generic glyph set.
const TABS = [
  { to: '/', label: 'Home', Icon: House },
  { to: '/fridge', label: 'Fridge', Icon: Refrigerator },
  { to: '/profile', label: 'Profile', Icon: ChefHat },
];

export default function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ ...springBouncy, delay: 0.35 }}
      className="fixed left-4 right-4 bottom-5 h-[66px] max-w-md mx-auto bg-ink rounded-full flex items-center justify-around z-50 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="relative flex flex-col items-center gap-[3px] p-1 no-underline min-w-[56px]"
        >
          {({ isActive }) => {
            const color = isActive ? ACTIVE : INACTIVE;
            return (
              <motion.div
                className="relative flex flex-col items-center gap-[3px] px-3 py-1.5"
                whileTap={{ scale: 0.88 }}
                transition={springSnappy}
              >
                {isActive && (
                  <motion.span
                    layoutId="navPill"
                    className="absolute inset-0 rounded-full bg-white/18 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                    transition={springLayout}
                  />
                )}
                <motion.div
                  animate={
                    isActive
                      ? { scale: 1.14, y: -2, rotate: [0, -8, 6, 0] }
                      : { scale: 1, y: 0, rotate: 0 }
                  }
                  transition={isActive ? { ...springBouncy, rotate: { duration: 0.45 } } : springSnappy}
                  className="relative z-10"
                >
                  <Icon size={21} color={color} strokeWidth={isActive ? 2.4 : 1.9} />
                </motion.div>
                <motion.span
                  className="relative z-10 text-[10px] font-bold"
                  style={{ color }}
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                >
                  {label}
                </motion.span>
              </motion.div>
            );
          }}
        </NavLink>
      ))}
    </motion.nav>
  );
}
