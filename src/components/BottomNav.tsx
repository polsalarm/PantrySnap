import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { House, Refrigerator, MessageCircle, ChefHat } from 'lucide-react';
import { springBouncy, springLayout, springSnappy } from '../lib/motion';

const ACTIVE = '#FFFFFF';
// Near-white, not a dimmed grey. The bar is deliberately thin (see .nav-glass),
// which leaves little luminance headroom: over a white card the composite only
// clears 4.5:1 down to about 0.86 alpha. So the inactive state is carried by
// weight, stroke and the missing capsule rather than by fading the label out.
const INACTIVE = 'rgba(255,255,255,0.86)';

// Hover is a pointer-only enhancement layered on top of the tap and active
// states, never the thing that tells you where you are.
const TAB_STATES = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -3 },
  tap: { scale: 0.88, y: 0 },
};
const HOVER_RIM = { rest: { opacity: 0 }, hover: { opacity: 1 } };

// Same Lucide icons used elsewhere on-screen — Refrigerator matches
// FridgeHome's empty state, MessageCircle matches Profile's own "Steve
// assistant" row, ChefHat matches Profile's hero avatar — so the nav echoes the
// page it points to instead of a generic glyph set.
const TABS = [
  { to: '/', label: 'Home', Icon: House },
  { to: '/fridge', label: 'Fridge', Icon: Refrigerator },
  { to: '/chat', label: 'Steve', Icon: MessageCircle },
  { to: '/profile', label: 'Profile', Icon: ChefHat },
];

export default function BottomNav() {
  return (
    <motion.nav
      aria-label="Main"
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ ...springBouncy, delay: 0.35 }}
      // bottom clears the home indicator on a real device; env() is 0 in the
      // desktop phone mockup, so the framed view is unchanged.
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      className="nav-glass fixed left-4 right-4 h-[66px] max-w-md mx-auto rounded-full flex items-center justify-around z-50"
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="relative flex flex-col items-center gap-[3px] p-1 no-underline min-w-[56px] rounded-full outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {({ isActive }) => {
            const color = isActive ? ACTIVE : INACTIVE;
            return (
              <motion.div
                className="relative flex flex-col items-center gap-[3px] px-3 py-1.5"
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                variants={TAB_STATES}
                transition={springSnappy}
              >
                {isActive && (
                  <motion.span
                    layoutId="navPill"
                    className="nav-glass-pill absolute inset-0 rounded-full"
                    transition={springLayout}
                  />
                )}
                {!isActive && (
                  <motion.span
                    variants={HOVER_RIM}
                    className="nav-glass-hover absolute inset-0 rounded-full pointer-events-none"
                    transition={springSnappy}
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
                  className="relative z-10 text-[10px]"
                  style={{ color, fontWeight: isActive ? 800 : 600 }}
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
