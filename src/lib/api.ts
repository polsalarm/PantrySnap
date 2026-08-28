// Client for the Phase 5 data-layer proxy (server/). See DATA_LAYER.md.
// All calls degrade gracefully: on failure/offline the caller falls back to
// local logic, keeping the app local-first.

import { tidyFoodMarkdown } from './plainChat';

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
  /** Spoonacular only; TheMealDB does not publish cook time or yield. */
  mins?: number;
  serves?: number;
  category?: string;
  level?: 'Easy' | 'Medium' | 'Hard';
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

export interface ExpiryAnalysisResp {
  estimatedExpiryDate: string;
  baselineDays: number;
  baselineMinDays: number;
  baselineMaxDays: number;
  dataSource: string;
  adjustedDays: number;
  source: 'foodkeeper' | 'foodkeeper+ai';
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  safetyNote: string;
}

export interface ExpiryAnalyzeReq {
  name?: string;
  category: string;
  storage: Storage;
  purchaseDate: string;
  expiryDateCurrent?: string;
  conditionNotes?: string;
  photoAnalysis?: { freshnessNote?: string; expirationNote?: string };
}

/**
 * Deterministic expiry estimate (FoodKeeper baseline + condition rules), with
 * optional AI reasoning. Public endpoint — no auth. Null if backend unreachable,
 * so the caller falls back to the local estimate.
 */
export async function analyzeExpiry(
  req: ExpiryAnalyzeReq,
): Promise<ExpiryAnalysisResp | null> {
  try {
    const res = await fetch(`${BASE}/expiry/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    return (await res.json()) as ExpiryAnalysisResp;
  } catch {
    return null;
  }
}

/** Real recipes (TheMealDB/Spoonacular), expiry-weighted. Null if backend unreachable. */
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

// ---- Phase 6: AI (Gemini via backend). All return null/throw-safe. ----

// Lazily pull the current Supabase access token (if signed in) for AI auth.
// Imported dynamically so the Supabase SDK stays out of the main bundle.
async function authHeader(): Promise<Record<string, string>> {
  try {
    const { cloudEnabled, getSupabase } = await import('./supabase');
    if (!cloudEnabled) return {};
    const { data } = await (await getSupabase()).auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function postJson<T>(path: string, body: unknown, timeoutMs = 30000): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (detail as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Friendly message for AI call failures (auth / rate limit / unavailable). */
export function aiErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'AI request was rejected. Try again.';
    if (e.status === 429) return e.message || 'Too many AI requests — slow down a moment.';
    if (e.status === 503) return 'AI is not available right now.';
    return e.message;
  }
  return 'AI request failed. Try again.';
}

/** True if the backend has AI configured (GEMINI key or Vertex). */
export async function aiAvailable(): Promise<boolean> {
  try {
    const h = await getJson<{ aiEnabled?: boolean }>('/health');
    return Boolean(h.aiEnabled);
  } catch {
    return false;
  }
}

export interface DetectedItem {
  name: string;
  category: string;
  quantityPct: number;
  freshnessNote?: string;
  expirationNote?: string;
  confidence?: number;
}

/**
 * Photo(s) -> detected items. Pass several angles of the same item for a more
 * accurate identification. Accepts data URLs or raw base64. Throws ApiError on failure.
 */
export async function detectItems(
  photos: { imageBase64: string; mimeType: string }[],
): Promise<DetectedItem[]> {
  const images = photos.map((p) => ({
    imageBase64: p.imageBase64.includes(',') ? p.imageBase64.split(',')[1] : p.imageBase64,
    mimeType: p.mimeType,
  }));
  const res = await postJson<{ items: DetectedItem[] }>('/detect', { images });
  return res.items;
}

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  usesExpiring: string[];
  basedOn?: string[];
}

/** Generate a recipe from on-hand + expiring items. Throws ApiError on failure. */
export async function generateRecipe(have: string[], expiring: string[]): Promise<GeneratedRecipe> {
  return postJson<GeneratedRecipe>('/recipe/generate', { have, expiring });
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/** Send a chat turn with pantry context. Throws ApiError on failure. */
export async function sendChat(
  messages: ChatMessage[],
  pantry: { name: string; expiryDate?: string; quantityPct?: number }[],
): Promise<string> {
  const res = await postJson<{ reply: string }>('/chat', { messages, pantry });
  return tidyFoodMarkdown(res.reply);
}

/** Convert an image Blob to a base64 data URL for /detect. */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
