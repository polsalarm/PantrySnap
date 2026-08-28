// Phase 6 AI features, grounded by the Phase 5 data layer.
import { Type } from '@google/genai';
import { gemini, MODELS, aiEnabled as geminiEnabled } from '../lib/gemini.js';
import { deepseekChat, deepseekEnabled } from '../lib/deepseek.js';
import { findRecipes } from './recipes.js';

const CATEGORIES =
  'dairy, milk, eggs, meat-raw, poultry-raw, fish-raw, vegetables, vegetables-leafy, ' +
  'fruit, bread, bakery, condiments, canned, dry-goods, frozen, beverages, leftovers, default';

export interface DetectedItem {
  name: string;
  category: string;
  quantityPct: number;
  freshnessNote?: string;
  expirationNote?: string;
  confidence?: number;
}

export interface DetectImage {
  imageBase64: string;
  mimeType: string;
}

/** Photo(s) -> list of pantry items (gemini-2.5-flash vision). Multiple images are
 *  treated as different angles/lighting of the SAME items for a more accurate ID. */
export async function detectItems(images: DetectImage[]): Promise<DetectedItem[]> {
  if (images.length === 0) return [];
  const multi = images.length > 1;
  const imageParts = images.map((im) => ({
    inlineData: { mimeType: im.mimeType, data: im.imageBase64 },
  }));
  const res = await gemini().models.generateContent({
    model: MODELS.flash,
    contents: [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text:
              (multi
                ? `These ${images.length} photos show the SAME item(s) from different angles or ` +
                  'lighting. Combine all of them for one accurate identification — use whichever ' +
                  'angle best shows labels, brand, or freshness. Do not double-count the same item. '
                : '') +
              'Identify the distinct food/grocery items in this photo. Look carefully: read any ' +
              'visible packaging text, brand, and labels, and use shape, color, and size as clues. ' +
              `For each item give: name (specific — e.g. "whole milk" not "drink"), a category from ` +
              `this list [${CATEGORIES}], and an estimated quantity remaining as a percentage (0-100). ` +
              'Note visible freshness signals (browning, wilting, damaged packaging, mold, cloudy ' +
              'liquid) or that no visual issue is visible, in freshnessNote. In expirationNote, say ' +
              'how the photo can or cannot affect the shelf-life estimate. Set confidence 0..1 ' +
              'honestly: lower it when the image is blurry, dark, partial, far away, or the item is ' +
              'ambiguous. If you genuinely cannot tell what an item is, omit it rather than guessing. ' +
              'Do not claim food is safe from the image alone. Only real food items.',
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            quantityPct: { type: Type.NUMBER },
            freshnessNote: { type: Type.STRING },
            expirationNote: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ['name', 'category', 'quantityPct'],
        },
      },
    },
  });
  return JSON.parse(res.text ?? '[]') as DetectedItem[];
}

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  usesExpiring: string[];
  basedOn: string[]; // real recipe titles used as grounding
}

/** Generate a recipe from on-hand + near-expiry items (gemini-2.5-pro), grounded by TheMealDB. */
export async function generateRecipe(have: string[], expiring: string[]): Promise<GeneratedRecipe> {
  const seed = await findRecipes(have, expiring, 5).catch(() => []);
  const seedText = seed
    .map((r) => `- ${r.title}: ${r.ingredients.join(', ')}`)
    .join('\n');

  const res = await gemini().models.generateContent({
    model: MODELS.pro,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              `On-hand ingredients: ${have.join(', ') || '(none)'}.\n` +
              `Expiring soon (use these first): ${expiring.join(', ') || '(none)'}.\n\n` +
              (seedText ? `Real reference recipes for grounding:\n${seedText}\n\n` : '') +
              'Create ONE practical recipe that prioritizes the expiring items and mostly uses ' +
              'on-hand ingredients. Keep steps concise and realistic.',
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          usesExpiring: { type: Type.ARRAY, items: { type: Type.STRING } },
          basedOn: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'ingredients', 'steps', 'usesExpiring'],
      },
    },
  });
  const out = JSON.parse(res.text ?? '{}') as GeneratedRecipe;
  out.basedOn ??= seed.map((r) => r.title);
  return out;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/** True when at least one provider can serve /api/chat. */
export const chatEnabled = deepseekEnabled || geminiEnabled;

/** Which provider chat will actually use. Surfaced on /api/health. */
export const chatProvider: 'deepseek' | 'gemini' | 'off' = deepseekEnabled
  ? 'deepseek'
  : geminiEnabled
    ? 'gemini'
    : 'off';

function systemPrompt(
  pantry: { name: string; expiryDate?: string; quantityPct?: number }[],
): string {
  const pantryText = pantry
    .map(
      (p) =>
        `${p.name}` +
        (p.expiryDate ? ` (expires ${p.expiryDate})` : '') +
        (typeof p.quantityPct === 'number' ? ` [${Math.round(p.quantityPct)}% left]` : ''),
    )
    .join(', ');

  return (
    'You are PantrySnap, a friendly kitchen assistant. Help the user cook with and not ' +
    'waste their food. Be concise and practical. Prefer ingredients they already have, ' +
    'and prioritize whatever is closest to expiring. Never claim food is safe to eat — ' +
    'expiry dates are estimates, so tell them to check it themselves.\n' +
    `Their pantry right now: ${pantryText || '(empty)'}.`
  );
}

/**
 * Conversational assistant over the user's pantry.
 * DeepSeek (deepseek-v4-flash) when DEEPSEEK_API_KEY is set, else Gemini.
 */
export async function chat(
  messages: ChatMessage[],
  pantry: { name: string; expiryDate?: string; quantityPct?: number }[],
): Promise<string> {
  if (deepseekEnabled) {
    return deepseekChat([
      { role: 'system', content: systemPrompt(pantry) },
      // App speaks Gemini's 'model'; OpenAI-compatible APIs call it 'assistant'.
      ...messages.map((m) => ({
        role: m.role === 'model' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      })),
    ]);
  }

  const res = await gemini().models.generateContent({
    model: MODELS.flash,
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction: systemPrompt(pantry),
      tools: [{ googleSearch: {} }],
    },
  });
  return res.text ?? '';
}
