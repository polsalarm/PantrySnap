import { NavLink } from 'react-router-dom';

const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(255,255,255,0.5)';

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function FridgeIcon({ color }: { color: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="5" y1="11" x2="19" y2="11" />
    </svg>
  );
}

function RecipesIcon({ color }: { color: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 4h13a2 2 0 0 1 2 2v14l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/fridge', label: 'Fridge', Icon: FridgeIcon },
  { to: '/recipes', label: 'Recipes', Icon: RecipesIcon },
  { to: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed left-4 right-4 bottom-5 h-[66px] max-w-md mx-auto bg-ink rounded-full flex items-center justify-around z-50 shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="flex flex-col items-center gap-[3px] p-1 no-underline">
          {({ isActive }) => {
            const color = isActive ? ACTIVE : INACTIVE;
            return (
              <>
                <Icon color={color} />
                <span className="text-[10px] font-bold" style={{ color }}>
                  {label}
                </span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}
