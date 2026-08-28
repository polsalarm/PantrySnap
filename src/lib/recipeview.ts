import type { Item } from './db';
import type { ApiRecipe } from './api';
import type { Recipe, RecipeLevel } from './recipes';
import { expiryStatus, daysUntil } from './expiry';

/** The single card shape both the backend and the local seed collapse into. */
export interface RecipeView {
  id: string;
  title: string;
  /** Lucide icon name, resolved via components/DishIcon.tsx. */
  iconKey: string;
  image?: string;
  category: string;
  level?: RecipeLevel;
  mins?: number;
  serves?: number;
  ingredients: string[];
  ingredientCount: number;
  /** How many of the recipe's ingredients are on hand. */
  haveCount: number;
  ready: boolean;
  /** Most-urgent on-hand ingredient this meal uses, if any. */
  rescues?: { name: string; days: number };
}

export const CATEGORY_TINT: Record<string, string> = {
  Breakfast: 'var(--color-tint-breakfast)',
  Lunch: 'var(--color-tint-lunch)',
  Dinner: 'var(--color-tint-dinner)',
  Snack: 'var(--color-tint-snack)',
};

export function tintFor(category: string): string {
  return CATEGORY_TINT[category] ?? 'var(--color-tint-dinner)';
}

function normalized(value: string): string {
  return value.toLowerCase().trim();
}

function matches(ingredient: string, itemName: string): boolean {
  const a = normalized(ingredient);
  const b = normalized(itemName);
  return a.includes(b) || b.includes(a);
}

/** Items at or past the "soon" threshold — the ones worth cooking first. */
export function urgentItems(items: Item[]): Item[] {
  return items.filter((i) => i.expiryDate && expiryStatus(i.expiryDate) !== 'fresh');
}

/**
 * The most-urgent pantry item a recipe actually consumes. Drives the card's one
 * accent colour, so it must reflect a real ingredient overlap rather than a
 * general "something is expiring" nudge — otherwise every card lights up red at
 * once and the single-accent palette stops meaning anything.
 */
export function findRescue(ingredients: string[], urgent: Item[]): RecipeView['rescues'] {
  const hits = urgent.filter((item) => ingredients.some((ing) => matches(ing, item.name)));
  if (hits.length === 0) return undefined;
  const soonest = hits.reduce((a, b) => (daysUntil(a.expiryDate) <= daysUntil(b.expiryDate) ? a : b));
  return { name: soonest.name, days: daysUntil(soonest.expiryDate) };
}

function countHave(ingredients: string[], items: Item[]): number {
  return ingredients.filter((ing) => items.some((item) => matches(ing, item.name))).length;
}

/**
 * Icon key for backend recipes, which ship a photo but no glyph. Resolves to a
 * Lucide icon name (see components/DishIcon.tsx) — never an emoji.
 */
export function iconKeyFor(title: string, category: string): string {
  const t = title.toLowerCase();
  if (/pasta|spaghetti|noodle/.test(t)) return 'utensils';
  if (/rice|risotto/.test(t)) return 'wheat';
  if (/soup|stew|broth/.test(t)) return 'soup';
  if (/salad/.test(t)) return 'salad';
  if (/sandwich|burger|melt/.test(t)) return 'sandwich';
  if (/egg|omelet|omelette/.test(t)) return 'egg-fried';
  if (/pizza/.test(t)) return 'pizza';
  if (/taco|burrito|wrap/.test(t)) return 'sandwich';
  if (/cake|pie|dessert/.test(t)) return 'cake-slice';
  if (/cookie/.test(t)) return 'cookie';
  if (/pancake|waffle|croissant/.test(t)) return 'croissant';
  if (/curry/.test(t)) return 'soup';
  if (/chicken|beef|pork|meat/.test(t)) return 'beef';
  if (/fish|seafood|salmon|shrimp/.test(t)) return 'fish';
  if (category === 'Breakfast') return 'egg-fried';
  if (category === 'Snack') return 'cookie';
  return 'chef-hat';
}

export function fromApi(recipe: ApiRecipe, items: Item[], urgent: Item[]): RecipeView {
  const category = recipe.category ?? 'Dinner';
  const haveCount = countHave(recipe.ingredients, items);
  return {
    id: recipe.id,
    title: recipe.title,
    iconKey: iconKeyFor(recipe.title, category),
    image: recipe.image,
    category,
    level: recipe.level,
    mins: recipe.mins,
    serves: recipe.serves,
    ingredients: recipe.ingredients,
    ingredientCount: recipe.ingredients.length,
    haveCount,
    ready: haveCount === recipe.ingredients.length,
    rescues: findRescue(recipe.ingredients, urgent),
  };
}

export function fromSeed(recipe: Recipe, items: Item[], urgent: Item[]): RecipeView {
  const haveCount = countHave(recipe.ingredients, items);
  return {
    id: recipe.id,
    title: recipe.name,
    iconKey: recipe.iconKey,
    category: recipe.category,
    level: recipe.level,
    mins: recipe.mins,
    serves: recipe.serves,
    ingredients: recipe.ingredients,
    ingredientCount: recipe.ingredients.length,
    haveCount,
    ready: haveCount === recipe.ingredients.length,
    rescues: findRescue(recipe.ingredients, urgent),
  };
}

export function rescueLabel(rescue: NonNullable<RecipeView['rescues']>): string {
  if (rescue.days < 0) return `${rescue.name} · expired`;
  if (rescue.days === 0) return `${rescue.name} · today`;
  if (rescue.days === 1) return `${rescue.name} · 1 day`;
  return `${rescue.name} · ${rescue.days} days`;
}
