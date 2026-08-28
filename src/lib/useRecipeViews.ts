import { useEffect, useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from './db';
import { RECIPE_SEED } from './recipes';
import { fetchRecipes } from './api';
import { fromApi, fromSeed, urgentItems, type RecipeView } from './recipeview';
import { recordCook } from './cooklog';

const SAVED_KEY = 'pantrysnap.saved';

function readSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Favourites are a per-device convenience, so localStorage rather than Dexie. */
export function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(readSaved);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable (private window) — favourites stay in-memory */
      }
      return next;
    });
  }, []);

  return { saved, toggle };
}

export interface RecipeViewsResult {
  items: Item[] | undefined;
  views: RecipeView[];
  busy: boolean;
  /** True when the backend answered; false means the local seed matcher ran. */
  online: boolean;
  cook: (recipe: RecipeView) => Promise<void>;
}

/**
 * Single source of recipe view-models. Both the Home and All-recipes tabs read
 * this so their notions of "ready" and "rescues" cannot drift apart.
 */
export function useRecipeViews(limit = 12): RecipeViewsResult {
  const items = useLiveQuery(() => db.items.toArray(), []);
  const [views, setViews] = useState<RecipeView[]>([]);
  const [busy, setBusy] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (items === undefined) return;
    let cancelled = false;

    async function load(stock: Item[]) {
      setBusy(true);
      const urgent = urgentItems(stock);
      const seedViews = RECIPE_SEED.map((r) => fromSeed(r, stock, urgent));

      if (stock.length === 0) {
        setOnline(false);
        setViews(seedViews);
        setBusy(false);
        return;
      }

      const api = await fetchRecipes(
        stock.map((i) => i.name),
        urgent.map((i) => i.name),
        limit,
      );
      if (cancelled) return;

      if (api && api.length > 0) {
        setOnline(true);
        const seedIds = new Set(seedViews.map((v) => v.id));
        const extras = api
          .map((r) => fromApi(r, stock, urgent))
          .filter((v) => !seedIds.has(v.id));
        setViews([...seedViews, ...extras].slice(0, Math.max(limit, seedViews.length)));
      } else {
        setOnline(false);
        setViews(seedViews);
      }
      setBusy(false);
    }

    load(items);
    return () => {
      cancelled = true;
    };
  }, [items, limit]);

  const cook = useCallback(
    async (recipe: RecipeView) => {
      await recordCook(recipe.id, recipe.title, recipe.ingredients, items ?? []);
    },
    [items],
  );

  return { items, views, busy: busy || items === undefined, online, cook };
}
