// Gemini client (Phase 6). Reads GEMINI_API_KEY from env (server/.env).
// Key-gated: if no key, the AI routes return 503 instead of crashing — the
// rest of the app (Phase 5 data layer) keeps working.
import { GoogleGenAI } from '@google/genai';

export const MODELS = {
  flash: 'gemini-2.5-flash', // detection, tips, chat — cheap/fast/high-frequency
  pro: 'gemini-2.5-pro', // recipe generation — quality
} as const;

const key = process.env.GEMINI_API_KEY?.trim();

export const aiEnabled = Boolean(key);

let client: GoogleGenAI | null = null;

export function gemini(): GoogleGenAI {
  if (!client) {
    if (!key) throw new Error('GEMINI_API_KEY not set');
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
}
