// Phase 6 AI features, grounded by the Phase 5 data layer.
import { Type } from '@google/genai';
import { gemini, MODELS } from '../lib/gemini.js';
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

/** Photo -> list of pantry items (gemini-2.5-flash vision). */
export async function detectItems(imageBase64: string, mimeType: string): Promise<DetectedItem[]> {
  const res = await gemini().models.generateContent({
    model: MODELS.flash,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          {
            text:
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

/** Conversational assistant over the user's pantry (gemini-2.5-flash + Search grounding). */
export async function chat(
  messages: ChatMessage[],
  pantry: { name: string; expiryDate?: string; quantityPct?: number }[],
): Promise<string> {
  const pantryText = pantry
    .map((p) => `${p.name}${p.expiryDate ? ` (expires ${p.expiryDate})` : ''}`)
    .join(', ');

  const res = await gemini().models.generateContent({
    model: MODELS.flash,
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction:
        'You are PantrySnap, a friendly kitchen assistant. Help the user cook with and not ' +
        'waste their food. Be concise and practical.\n' +
        `Their pantry right now: ${pantryText || '(empty)'}.`,
      tools: [{ googleSearch: {} }],
    },
  });
  return res.text ?? '';
}
