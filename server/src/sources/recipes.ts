// Recipe lookup via TheMealDB (free, no key). Ranked by on-hand match,
// with near-expiry ingredients weighted higher (cook-to-beat-expiry).
// Docs: https://www.themealdb.com/api.php
import { cached, TTL } from '../lib/cache.js';

export interface RankedRecipe {
  id: string;
  title: string;
  image: string;
  matchCount: number;
  totalCount: number;
  usesExpiring: string[];
  ingredients: string[];
  steps: string[];
  source: 'themealdb';
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

export async function findRecipes(
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
      steps: (meal.strInstructions ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
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
