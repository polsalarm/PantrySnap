// Client for the Phase 5 data-layer proxy (server/). See DATA_LAYER.md.
// All calls degrade gracefully: on failure/offline the caller falls back to
// local logic, keeping the app local-first.

const BASE = import.meta.env.VITE_API_BASE ?? '/api';

export type Storage = 'fridge' | 'freezer' | 'pantry';

export interface ShelfLifeResp {
  category: string;
  storage: Storage;
  days: number;
  source: string;
  matched: boolean;
}

export interface ApiRecipe {
  id: string;
  title: string;
  image: string;
  matchCount: number;
  totalCount: number;
  usesExpiring: string[];
  ingredients: string[];
  steps: string[];
  source: string;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    signal: signal ?? AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`api ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

/** Shelf-life in days for a category + storage. Null if backend unreachable. */
export async function fetchShelfLife(
  category: string,
  storage: Storage,
): Promise<ShelfLifeResp | null> {
  try {
    return await getJson<ShelfLifeResp>(
      `/shelflife?category=${encodeURIComponent(category)}&storage=${storage}`,
    );
  } catch {
    return null;
  }
}

/** Real recipes (TheMealDB), expiry-weighted. Null if backend unreachable. */
export async function fetchRecipes(
  have: string[],
  expiring: string[],
  limit = 10,
): Promise<ApiRecipe[] | null> {
  if (have.length === 0) return [];
  try {
    const data = await getJson<{ recipes: ApiRecipe[] }>(
      `/recipes?have=${encodeURIComponent(have.join(','))}` +
        `&expiring=${encodeURIComponent(expiring.join(','))}&limit=${limit}`,
    );
    return data.recipes;
  } catch {
    return null;
  }
}
