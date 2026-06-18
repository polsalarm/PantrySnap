// Expiry analysis: FoodKeeper baseline + condition-note heuristics, with AI as an
// optional explanation layer only. The numbers are always deterministic so the
// feature works offline and never relies on the model to assert food safety.
import { getShelfLife, type Storage } from './shelflife.js';
import { lookupProduct } from './openfoodfacts.js';
import { aiEnabled } from '../lib/gemini.js';
import { gemini, MODELS } from '../lib/gemini.js';

export interface PhotoAnalysis {
  freshnessNote?: string;
  expirationNote?: string;
  confidence?: number;
}

export interface ExpiryRequest {
  name?: string;
  category: string;
  storage?: Storage;
  purchaseDate: string; // YYYY-MM-DD
  expiryDateCurrent?: string;
  conditionNotes?: string;
  photoAnalysis?: PhotoAnalysis;
}

export interface ExpiryResult {
  estimatedExpiryDate: string;
  baselineDays: number;
  baselineMinDays: number;
  baselineMaxDays: number;
  dataSource: string; // e.g. "USDA FoodKeeper" or "estimate"
  source: 'foodkeeper' | 'foodkeeper+ai';
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  safetyNote: string;
  adjustedDays: number;
}

const SAFETY_NOTE =
  'When in doubt, discard food that smells off, has mold, or has unsafe texture/color changes.';

// Signals that mean "treat as unsafe now" — override the baseline to 0 days.
const HIGH_RISK = ['mold', 'smell', 'rancid', 'slimy', 'slime', 'spoil', 'rotten', 'cloudy', 'off'];
// Signals that shorten remaining life.
const OPENED = ['opened', 'open'];
const COOKED = ['cooked', 'leftover'];

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Deterministic baseline + condition adjustment. AI never changes the numbers. */
export async function analyzeExpiry(req: ExpiryRequest): Promise<ExpiryResult> {
  const storage: Storage = req.storage ?? 'fridge';
  let shelf = getShelfLife(req.category, storage);

  // Open Food Facts: when the category didn't match (likely a packaged product),
  // try to identify it by name and re-derive the baseline from a better category.
  let offNote: string | undefined;
  if (!shelf.matched && req.name?.trim()) {
    try {
      const off = await lookupProduct(req.name.trim());
      if (off.matched && off.category !== 'default') {
        const better = getShelfLife(off.category, storage);
        if (better.matched) {
          shelf = better;
          offNote = `Identified "${off.name}" via Open Food Facts as ${off.category}.`;
        }
      }
    } catch {
      // Network/timeout — keep the local baseline.
    }
  }

  const baselineDays = shelf.days;

  const notes = (req.conditionNotes ?? '').toLowerCase();
  const photoText = [req.photoAnalysis?.freshnessNote, req.photoAnalysis?.expirationNote]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const allText = `${notes} ${photoText}`;

  let adjustedDays = baselineDays;
  let confidence: ExpiryResult['confidence'] = shelf.matched ? 'medium' : 'low';
  const rangeText =
    shelf.minDays === shelf.maxDays
      ? `${shelf.maxDays} days`
      : `${shelf.minDays}–${shelf.maxDays} days (baseline uses ${shelf.maxDays})`;
  const reasoning: string[] = [];
  if (offNote) reasoning.push(offNote);
  reasoning.push(
    shelf.matched
      ? `${shelf.source} range for ${shelf.category} in ${storage}: ${rangeText}.`
      : `No exact match for "${req.category}"; using a default ${baselineDays}-day estimate in ${storage}.`,
  );
  if (shelf.notes) reasoning.push(shelf.notes);

  const highRisk = hasAny(allText, HIGH_RISK);
  if (highRisk) {
    adjustedDays = 0;
    confidence = 'high';
    reasoning.push(
      'Condition/photo signals possible spoilage (mold, off smell, or unsafe texture) — treat as unsafe now.',
    );
  } else {
    if (hasAny(notes, COOKED)) {
      adjustedDays = Math.min(adjustedDays, 4); // cooked/leftovers: ~3-4 days in fridge
      reasoning.push('Marked cooked/leftover — capped to a few fridge days.');
    }
    if (hasAny(notes, OPENED)) {
      adjustedDays = Math.max(1, Math.round(adjustedDays * 0.6));
      reasoning.push('Marked opened — remaining life shortened.');
    }
    if (req.photoAnalysis?.freshnessNote && !highRisk) {
      reasoning.push('Photo shows no obvious spoilage, but an image alone cannot confirm safety.');
    }
  }

  let source: ExpiryResult['source'] = 'foodkeeper';

  // Optional AI explanation layer — rewrites reasoning prose only, never the numbers.
  if (aiEnabled) {
    try {
      const aiReasoning = await explain(req, { baselineDays, adjustedDays, highRisk });
      if (aiReasoning.length) {
        reasoning.push(...aiReasoning);
        source = 'foodkeeper+ai';
      }
    } catch {
      // AI is best-effort; deterministic result already stands.
    }
  }

  return {
    estimatedExpiryDate: addDays(req.purchaseDate, adjustedDays),
    baselineDays,
    baselineMinDays: shelf.minDays,
    baselineMaxDays: shelf.maxDays,
    dataSource: shelf.source,
    adjustedDays,
    source,
    confidence,
    reasoning,
    safetyNote: SAFETY_NOTE,
  };
}

/** Ask Gemini for short extra context. Must not invent safety claims or numbers. */
async function explain(
  req: ExpiryRequest,
  computed: { baselineDays: number; adjustedDays: number; highRisk: boolean },
): Promise<string[]> {
  const res = await gemini().models.generateContent({
    model: MODELS.flash,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              `Item: ${req.name ?? req.category} (category ${req.category}, ${req.storage ?? 'fridge'}).\n` +
              `Computed baseline ${computed.baselineDays} days, adjusted ${computed.adjustedDays} days.\n` +
              `User notes: ${req.conditionNotes || '(none)'}.\n` +
              `Photo notes: ${req.photoAnalysis?.freshnessNote || '(none)'}.\n\n` +
              'Give 1-2 short plain-language reasons that justify the adjusted estimate. ' +
              'Do NOT change the numbers. Do NOT claim the food is definitely safe. ' +
              'Return a JSON array of strings.',
          },
        ],
      },
    ],
    config: { responseMimeType: 'application/json' },
  });
  const out = JSON.parse(res.text ?? '[]');
  return Array.isArray(out) ? out.filter((s) => typeof s === 'string').slice(0, 2) : [];
}
