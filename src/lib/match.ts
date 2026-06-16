import type { Item } from './db';
import type { Recipe } from './recipes';

export interface RecipeMatch {
  recipe: Recipe;
  matched: string[];
  missing: string[];
  matchPct: number;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function matchRecipes(items: Item[], recipes: Recipe[]): RecipeMatch[] {
  const onHand = items.map((item) => normalize(item.name));

  const matches = recipes.map((recipe) => {
    const matched: string[] = [];
    const missing: string[] = [];
    for (const ingredient of recipe.ingredients) {
      const needle = normalize(ingredient);
      const have = onHand.some((name) => name.includes(needle) || needle.includes(name));
      if (have) matched.push(ingredient);
      else missing.push(ingredient);
    }
    const matchPct = Math.round((matched.length / recipe.ingredients.length) * 100);
    return { recipe, matched, missing, matchPct };
  });

  return matches.sort((a, b) => b.matchPct - a.matchPct);
}
