// Recipe lookup via TheMealDB (free, no key). Ranked by on-hand match,
// with near-expiry ingredients weighted higher (cook-to-beat-expiry).
// Docs: https://www.themealdb.com/api.php
import { cached, TTL } from '../lib/cache.js';
import { spoonacularEnabled, spoonacularRecipes } from './spoonacular.js';

export interface RankedRecipe {
  id: string;
  title: string;
  image: string;
  matchCount: number;
  totalCount: number;
  usesExpiring: string[];
  ingredients: string[];
  steps: string[];
  /** Cook time in minutes. Spoonacular only — TheMealDB does not publish it. */
  mins?: number;
  /** Servings yielded. Spoonacular only. */
  serves?: number;
  /** Meal category (Breakfast/Lunch/Dinner/Snack-ish). Both sources supply one. */
  category?: string;
  /** Derived, not sourced: no recipe API publishes a difficulty rating. */
  level?: 'Easy' | 'Medium' | 'Hard';
  source: 'themealdb' | 'spoonacular';
}

/**
 * Difficulty is inferred from recipe shape because neither upstream API exposes it.
 * Kept here so both sources rate consistently.
 */
export function deriveLevel(ingredientCount: number, stepCount: number): 'Easy' | 'Medium' | 'Hard' {
  const weight = ingredientCount + stepCount * 1.5;
  if (weight <= 12) return 'Easy';
  if (weight <= 22) return 'Medium';
  return 'Hard';
}

/** Normalise upstream category vocabularies onto the four the UI tints by. */
export function normaliseCategory(raw?: string): string {
  const c = (raw ?? '').toLowerCase();
  if (/breakfast|brunch/.test(c)) return 'Breakfast';
  if (/side|salad|starter|lunch|sandwich|soup|appetizer/.test(c)) return 'Lunch';
  if (/dessert|snack|sweet/.test(c)) return 'Snack';
  return 'Dinner';
}

const BASE = 'https://www.themealdb.com/api/json/v1/1';

interface MealFull {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  [k: string]: string | undefined;
}

function extractIngredients(meal: MealFull): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && ing.trim()) out.push(ing.trim().toLowerCase());
  }
  return out;
}

async function filterByIngredient(ing: string): Promise<string[]> {
  return cached(`mealdb:filter:${ing}`, TTL.recipes, async () => {
    try {
      const url = `${BASE}/filter.php?i=${encodeURIComponent(ing)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = (await res.json()) as { meals?: { idMeal: string }[] | null };
      return (data.meals ?? []).map((m) => m.idMeal);
    } catch {
      return []; // one slow/failed ingredient must not sink the whole request
    }
  });
}

async function getMeal(id: string): Promise<MealFull | null> {
  return cached(`mealdb:meal:${id}`, TTL.recipes, async () => {
    try {
      const res = await fetch(`${BASE}/lookup.php?i=${id}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const data = (await res.json()) as { meals?: MealFull[] | null };
      return data.meals?.[0] ?? null;
    } catch {
      return null;
    }
  });
}

export async function mealDbRecipes(
  have: string[],
  expiring: string[],
  limit = 10,
): Promise<RankedRecipe[]> {
  const haveSet = new Set(have.map((h) => h.toLowerCase().trim()).filter(Boolean));
  const expSet = new Set(expiring.map((e) => e.toLowerCase().trim()).filter(Boolean));
  if (haveSet.size === 0) return [];

  // Gather candidate meal ids from each on-hand ingredient.
  const idSets = await Promise.all([...haveSet].map((i) => filterByIngredient(i)));
  const candidates = new Set<string>();
  for (const ids of idSets) for (const id of ids) candidates.add(id);

  // Hydrate a bounded number of candidates, then rank.
  const meals = (await Promise.all([...candidates].slice(0, 25).map(getMeal))).filter(
    (m): m is MealFull => m !== null,
  );

  const ranked: RankedRecipe[] = meals.map((meal) => {
    const ingredients = extractIngredients(meal);
    const steps = (meal.strInstructions ?? '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const matched = ingredients.filter((ing) =>
      [...haveSet].some((h) => ing.includes(h) || h.includes(ing)),
    );
    const usesExpiring = ingredients.filter((ing) =>
      [...expSet].some((e) => ing.includes(e) || e.includes(ing)),
    );
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      matchCount: matched.length,
      totalCount: ingredients.length,
      usesExpiring,
      ingredients,
      steps,
      category: normaliseCategory(meal.strCategory),
      level: deriveLevel(ingredients.length, steps.length),
      source: 'themealdb' as const,
    };
  });

  // Rank: expiry rescues first, then raw match count, then match ratio.
  ranked.sort(
    (a, b) =>
      b.usesExpiring.length - a.usesExpiring.length ||
      b.matchCount - a.matchCount ||
      b.matchCount / b.totalCount - a.matchCount / a.totalCount,
  );

  return ranked.slice(0, limit);
}

// Dispatcher: prefer Spoonacular (richer) when keyed, else TheMealDB.
// Spoonacular failure (quota/network) falls back to TheMealDB so recipes never break.
export async function findRecipes(
  have: string[],
  expiring: string[],
  limit = 10,
): Promise<RankedRecipe[]> {
  if (spoonacularEnabled()) {
    try {
      const r = await spoonacularRecipes(have, expiring, limit);
      if (r.length > 0) return r;
    } catch {
      /* fall through to TheMealDB */
    }
  }
  return mealDbRecipes(have, expiring, limit);
}
