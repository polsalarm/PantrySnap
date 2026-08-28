import {
  Milk,
  Egg,
  Beef,
  Fish,
  Drumstick,
  Carrot,
  Sprout,
  Leaf,
  Apple,
  Banana,
  Cherry,
  Grape,
  Citrus,
  Nut,
  Croissant,
  Wheat,
  Soup,
  CupSoda,
  Coffee,
  PopcornIcon,
  IceCreamCone,
  Snowflake,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { ShelfId } from '../lib/db';

// Same Lucide set as DishIcon.tsx — the Fridge screen previously used a
// separate hand-drawn cartoon icon pack (FoodIcons.tsx), which read as a
// different app next to the Home/Recipes tabs. This keeps every screen on
// one icon language.
const ICONS: Record<string, LucideIcon> = {
  milk: Milk,
  egg: Egg,
  beef: Beef,
  fish: Fish,
  poultry: Drumstick,
  carrot: Carrot,
  sprout: Sprout,
  leaf: Leaf,
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  grape: Grape,
  citrus: Citrus,
  nut: Nut,
  croissant: Croissant,
  wheat: Wheat,
  soup: Soup,
  'cup-soda': CupSoda,
  coffee: Coffee,
  popcorn: PopcornIcon,
  'ice-cream': IceCreamCone,
  snowflake: Snowflake,
  package: Package,
};

/**
 * Resolves a pantry item to an icon key. Tries a specific ingredient match
 * first (items are free-text, scanned or typed), then falls back to the
 * item's storage category so anything unrecognized still lands on a sensible
 * icon rather than a generic box.
 */
export function itemIconKeyFor(name: string, category: string): string {
  const n = name.toLowerCase();

  if (/milk|cream|half.and.half/.test(n)) return 'milk';
  if (/egg/.test(n)) return 'egg';
  if (/chicken|turkey|poultry|drumstick|wing/.test(n)) return 'poultry';
  if (/beef|pork|steak|bacon|sausage|ham|lamb/.test(n)) return 'beef';
  if (/fish|salmon|tuna|shrimp|seafood|prawn/.test(n)) return 'fish';
  if (/carrot/.test(n)) return 'carrot';
  if (/garlic|onion|ginger|potato|beet|radish/.test(n)) return 'sprout';
  if (/spinach|lettuce|kale|greens|herb|basil|cilantro|parsley|broccoli|cabbage/.test(n))
    return 'leaf';
  if (/apple/.test(n)) return 'apple';
  if (/banana/.test(n)) return 'banana';
  if (/cherry|strawberr|raspberr|berry|berries/.test(n)) return 'cherry';
  if (/grape/.test(n)) return 'grape';
  if (/orange|lemon|lime|citrus|grapefruit/.test(n)) return 'citrus';
  if (/nut|almond|cashew|peanut/.test(n)) return 'nut';
  if (/bread|croissant|bun|bagel|pastry|roll/.test(n)) return 'croissant';
  if (/rice|pasta|noodle|flour|grain|cereal|oat/.test(n)) return 'wheat';
  if (/soup|broth|stock|leftover/.test(n)) return 'soup';
  if (/soda|juice|drink/.test(n)) return 'cup-soda';
  if (/coffee|tea/.test(n)) return 'coffee';
  if (/popcorn|chip|snack/.test(n)) return 'popcorn';
  if (/ice cream|gelato|sorbet/.test(n)) return 'ice-cream';

  const c = category.toLowerCase();
  if (c === 'dairy') return 'milk';
  if (c === 'meat') return 'beef';
  if (c === 'seafood') return 'fish';
  if (c === 'produce') return 'carrot';
  if (c === 'bakery') return 'croissant';
  if (c === 'beverages') return 'cup-soda';
  if (c === 'frozen') return 'snowflake';
  if (c === 'pantry' || c === 'condiments') return 'wheat';
  if (c === 'leftovers') return 'soup';
  return 'package';
}

/** Frozen storage always reads as frozen, regardless of what the item is. */
export function itemIconKeyForShelf(name: string, category: string, shelfId: ShelfId): string {
  if (shelfId === 'freezer') return 'snowflake';
  return itemIconKeyFor(name, category);
}

export default function ItemIcon({
  iconKey,
  size = 24,
  className = '',
  strokeWidth = 1.75,
}: {
  iconKey: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[iconKey] ?? Package;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
