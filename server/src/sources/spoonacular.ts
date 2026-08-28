// Spoonacular recipe lookup (richer than TheMealDB). Used when SPOONACULAR_API_KEY
// is set; otherwise the dispatcher falls back to TheMealDB. Free tier ~150 points/day.
// Docs: https://spoonacular.com/food-api/docs
import { cached, TTL } from '../lib/cache.js';
import { deriveLevel, normaliseCategory, type RankedRecipe } from './recipes.js';

const BASE = 'https://api.spoonacular.com';
const key = () => process.env.SPOONACULAR_API_KEY?.trim();

export const spoonacularEnabled = () => Boolean(key());

interface FindResult {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: { name: string }[];
  missedIngredients: { name: string }[];
}

interface InfoResult {
  extendedIngredients?: { name: string }[];
  analyzedInstructions?: { steps: { step: string }[] }[];
  readyInMinutes?: number;
  servings?: number;
  dishTypes?: string[];
}

async function getInfo(id: number): Promise<InfoResult | null> {
  return cached(`spoon:info:${id}`, TTL.recipes, async () => {
    try {
      const url = `${BASE}/recipes/${id}/information?includeNutrition=false&apiKey=${key()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      return (await res.json()) as InfoResult;
    } catch {
      return null;
    }
  });
}

export async function spoonacularRecipes(
  have: string[],
  expiring: string[],
  limit = 10,
): Promise<RankedRecipe[]> {
  const ingredients = have.map((h) => h.trim()).filter(Boolean);
  if (ingredients.length === 0 || !key()) return [];
  const expSet = new Set(expiring.map((e) => e.toLowerCase().trim()).filter(Boolean));

  const found = await cached(
    `spoon:find:${ingredients.join(',').toLowerCase()}:${limit}`,
    TTL.recipes,
    async () => {
      // ranking=1 maximises used ingredients (minimise what you'd have to buy).
      const url =
        `${BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients.join(','))}` +
        `&number=${limit}&ranking=1&ignorePantry=true&apiKey=${key()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`spoonacular ${res.status}`);
      return (await res.json()) as FindResult[];
    },
  );

  const recipes = await Promise.all(
    found.map(async (r): Promise<RankedRecipe> => {
      const info = await getInfo(r.id);
      const ingredientNames =
        info?.extendedIngredients?.map((i) => i.name) ??
        [...r.usedIngredients, ...r.missedIngredients].map((i) => i.name);
      const steps = info?.analyzedInstructions?.[0]?.steps?.map((s) => s.step) ?? [];
      const usesExpiring = r.usedIngredients
        .map((i) => i.name)
        .filter((n) => [...expSet].some((e) => n.toLowerCase().includes(e) || e.includes(n.toLowerCase())));
      return {
        id: String(r.id),
        title: r.title,
        image: r.image,
        matchCount: r.usedIngredientCount,
        totalCount: r.usedIngredientCount + r.missedIngredientCount,
        usesExpiring,
        ingredients: ingredientNames,
        steps,
        mins: info?.readyInMinutes,
        serves: info?.servings,
        category: normaliseCategory(info?.dishTypes?.[0]),
        level: deriveLevel(ingredientNames.length, steps.length),
        source: 'spoonacular',
      };
    }),
  );

  // Expiry rescues first, then most on-hand ingredients used.
  recipes.sort(
    (a, b) => b.usesExpiring.length - a.usesExpiring.length || b.matchCount - a.matchCount,
  );
  return recipes;
}
