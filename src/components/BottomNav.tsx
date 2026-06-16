import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { to: '/', label: 'Fridge', icon: 'kitchen' },
  { to: '/items', label: 'Items', icon: 'inventory_2' },
  { to: '/alerts', label: 'Alerts', icon: 'notification_important' },
  { to: '/recipes', label: 'Recipes', icon: 'restaurant_menu' },
];

export default function BottomNav() {
  return (
    <nav className="bg-surface shadow-[0_-4px_12px_rgba(47,93,58,0.08)] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1 rounded-full transition-colors ${
              isActive ? 'bg-primary-soft text-primary-dark' : 'text-text-muted hover:bg-border-soft'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={tab.icon} filled={isActive} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
