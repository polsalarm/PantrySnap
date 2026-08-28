import {
  Utensils,
  Wheat,
  Soup,
  Salad,
  Sandwich,
  EggFried,
  Pizza,
  CakeSlice,
  Cookie,
  Croissant,
  Beef,
  Fish,
  ChefHat,
  type LucideIcon,
} from 'lucide-react';

// Lucide (ISC-licensed, MIT-compatible) — no emoji, no generic placeholders.
const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  wheat: Wheat,
  soup: Soup,
  salad: Salad,
  sandwich: Sandwich,
  'egg-fried': EggFried,
  pizza: Pizza,
  'cake-slice': CakeSlice,
  cookie: Cookie,
  croissant: Croissant,
  beef: Beef,
  fish: Fish,
  'chef-hat': ChefHat,
};

export default function DishIcon({
  iconKey,
  size = 24,
  className = '',
  strokeWidth = 2,
}: {
  iconKey: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[iconKey] ?? ChefHat;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
