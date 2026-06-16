// Gemini client (Phase 6). Two modes, chosen by env:
//
//  1) AI Studio   — set GEMINI_API_KEY (simple key, free tier).
//  2) Vertex AI   — set GOOGLE_GENAI_USE_VERTEXAI=true + GOOGLE_CLOUD_PROJECT
//                   + GOOGLE_CLOUD_LOCATION, and authenticate with ADC
//                   (`gcloud auth application-default login`). Vertex bills the
//                   Cloud project, so the $300 free-trial credits apply here.
//
// Key-gated: if neither is configured, AI routes return 503 and the rest of the
// app (Phase 5 data layer) keeps working.
import { GoogleGenAI } from '@google/genai';

export const MODELS = {
  flash: 'gemini-2.5-flash', // detection, tips, chat — cheap/fast/high-frequency
  pro: 'gemini-2.5-pro', // recipe generation — quality
} as const;

const apiKey = process.env.GEMINI_API_KEY?.trim();
const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI?.toLowerCase() === 'true';
const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
const location = process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'us-central1';

export const aiMode: 'vertex' | 'apikey' | 'off' = useVertex
  ? project
    ? 'vertex'
    : 'off'
  : apiKey
    ? 'apikey'
    : 'off';

export const aiEnabled = aiMode !== 'off';

let client: GoogleGenAI | null = null;

export function gemini(): GoogleGenAI {
  if (!client) {
    if (aiMode === 'vertex') {
      // ADC supplies credentials (gcloud login or a service account on deploy).
      client = new GoogleGenAI({ vertexai: true, project, location });
    } else if (aiMode === 'apikey') {
      client = new GoogleGenAI({ apiKey });
    } else {
      throw new Error('AI not configured (set GEMINI_API_KEY or Vertex env vars)');
    }
  }
  return client;
}
