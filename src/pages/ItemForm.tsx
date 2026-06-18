import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, SHELF_SEED, withUid, type ExpirySource, type ShelfId } from '../lib/db';
import { CATEGORIES, estimateExpiryDate, estimateShelfLifeDays } from '../lib/expiry';
import { analyzeExpiry, detectItems, blobToBase64, aiErrorMessage, type Storage } from '../lib/api';
import { useAuth } from '../lib/useAuth';
import Icon from '../components/Icon';
import PhotoThumb from '../components/PhotoThumb';

const today = () => new Date().toISOString().slice(0, 10);

// Fridge shelves map to "fridge" storage; pantry to "pantry". (No freezer shelf yet.)
const storageForShelf = (shelfId: ShelfId): Storage => (shelfId === 'pantry' ? 'pantry' : 'fridge');

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface EstimateInfo {
  days: number; // adjusted days that set the expiry date
  baselineDays?: number; // pre-adjustment baseline (max of range)
  baselineMinDays?: number;
  baselineMaxDays?: number;
  dataSource?: string; // e.g. "USDA FoodKeeper"
  category: string;
  storage: Storage;
  source: 'foodkeeper' | 'foodkeeper+ai' | 'local';
  matched: boolean;
  reasoning?: string[];
  confidence?: 'low' | 'medium' | 'high';
  safetyNote?: string;
  analyzing?: boolean;
}

const initialEstimate = (category: string, shelfId: ShelfId): EstimateInfo => ({
  days: estimateShelfLifeDays(category),
  category,
  storage: storageForShelf(shelfId),
  source: 'local',
  matched: false,
});

const CONDITION_HINTS = ['opened', 'cooked', 'sealed', 'smells off', 'mold visible'];

// Map the backend's detected category to a frontend CATEGORIES value.
function mapDetectedCategory(detected: string): string {
  const d = detected.toLowerCase();
  if (CATEGORIES.includes(d)) return d;
  if (/milk|dairy|egg|cheese|yogurt/.test(d)) return 'dairy';
  if (/poultry|meat|beef|pork|chicken/.test(d)) return 'meat';
  if (/fish|seafood/.test(d)) return 'seafood';
  if (/veg|fruit|produce|leaf/.test(d)) return 'produce';
  if (/bread|bakery/.test(d)) return 'bakery';
  if (/condiment|sauce/.test(d)) return 'condiments';
  if (/can|dry|pantry|grain|pasta|rice/.test(d)) return 'pantry';
  if (/frozen/.test(d)) return 'frozen';
  if (/beverage|drink|juice/.test(d)) return 'beverages';
  if (/leftover/.test(d)) return 'leftovers';
  return CATEGORIES.includes('other') ? 'other' : (CATEGORIES[0] ?? 'other');
}

export default function ItemForm() {
  const { itemId } = useParams<{ itemId: string }>();
  const isEdit = Boolean(itemId);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shelfId, setShelfId] = useState<ShelfId>('middle');
  const [quantityPct, setQuantityPct] = useState(100);
  const [lowStockThresholdPct, setLowStockThresholdPct] = useState(20);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(estimateExpiryDate(today(), CATEGORIES[0]));
  const [expirySource, setExpirySource] = useState<ExpirySource>('estimated');
  const [conditionNotes, setConditionNotes] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [visualAnalysis, setVisualAnalysis] = useState<string | null>(null);
  const [estimateInfo, setEstimateInfo] = useState<EstimateInfo>(() =>
    initialEstimate(CATEGORIES[0], 'middle'),
  );
  const auth = useAuth();
  const aiLocked = auth.aiRequiresSignIn && !auth.signedIn;

  useEffect(() => {
    if (!isEdit) return;
    db.items.get(Number(itemId)).then((item) => {
      if (!item) return;
      setName(item.name);
      setCategory(item.category);
      setShelfId(item.shelfId);
      setQuantityPct(item.quantityPct);
      setLowStockThresholdPct(item.lowStockThresholdPct);
      setPurchaseDate(item.purchaseDate);
      setExpiryDate(item.expiryDate);
      setExpirySource(item.expirySource);
      setConditionNotes(item.conditionNotes ?? '');
      setPhotoBlob(item.photoBlob);
      setEstimateInfo(initialEstimate(item.category, item.shelfId));
    });
  }, [isEdit, itemId]);

  // Refine the estimated expiry via the backend analyzer (FoodKeeper baseline +
  // condition-note rules + optional AI reasoning). Instant local estimate stays
  // as the offline fallback; backend overrides it when reachable.
  async function refineEstimate(
    purchase: string,
    cat: string,
    shelf: ShelfId,
    notesOverride?: string,
    photoOverride?: string,
  ) {
    const storage = storageForShelf(shelf);
    const notes = (notesOverride ?? conditionNotes).trim();
    const photoNote = photoOverride ?? visualAnalysis ?? '';
    setEstimateInfo((prev) => ({ ...prev, analyzing: true }));
    const res = await analyzeExpiry({
      name: name.trim() || undefined,
      category: cat,
      storage,
      purchaseDate: purchase,
      expiryDateCurrent: expiryDate,
      conditionNotes: notes || undefined,
      photoAnalysis: photoNote ? { freshnessNote: photoNote } : undefined,
    });
    if (res) {
      setExpiryDate(res.estimatedExpiryDate);
      setEstimateInfo({
        days: res.adjustedDays,
        baselineDays: res.baselineDays,
        baselineMinDays: res.baselineMinDays,
        baselineMaxDays: res.baselineMaxDays,
        dataSource: res.dataSource,
        category: cat,
        storage,
        source: res.source,
        matched: true,
        reasoning: res.reasoning,
        confidence: res.confidence,
        safetyNote: res.safetyNote,
      });
      return;
    }
    // Offline: keep the instant local estimate.
    setExpiryDate(addDays(purchase, estimateShelfLifeDays(cat)));
    setEstimateInfo(initialEstimate(cat, shelf));
  }

  function handlePurchaseDateChange(value: string) {
    setPurchaseDate(value);
    if (expirySource === 'estimated') {
      setExpiryDate(estimateExpiryDate(value, category));
      setEstimateInfo(initialEstimate(category, shelfId));
      void refineEstimate(value, category, shelfId);
    }
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    if (expirySource === 'estimated') {
      setExpiryDate(estimateExpiryDate(purchaseDate, value));
      setEstimateInfo(initialEstimate(value, shelfId));
      void refineEstimate(purchaseDate, value, shelfId);
    }
  }

  function handleShelfChange(value: ShelfId) {
    setShelfId(value);
    if (expirySource === 'estimated') {
      setEstimateInfo(initialEstimate(category, value));
      void refineEstimate(purchaseDate, category, value);
    }
  }

  function handleExpiryDateChange(value: string) {
    setExpiryDate(value);
    setExpirySource('manual');
  }

  function appendConditionNote(note: string) {
    const parts = conditionNotes
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.some((part) => part.toLowerCase() === note.toLowerCase())) return;
    const next = [...parts, note].join(', ');
    setConditionNotes(next);
    if (expirySource === 'estimated') void refineEstimate(purchaseDate, category, shelfId, next);
  }

  function handleConditionNotesBlur() {
    if (expirySource === 'estimated') void refineEstimate(purchaseDate, category, shelfId);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBlob(file);
    setVisualAnalysis(null);

    // AI auto-detect needs sign-in — skip the guaranteed-401 call, hint instead.
    if (aiLocked) {
      setScanMsg('Sign in (Account) to auto-fill and analyze items from the photo.');
      return;
    }

    // AI scan: detect the item and pre-fill the form. Best-effort — failure is silent-ish.
    setScanning(true);
    setScanMsg(null);
    try {
      const dataUrl = await blobToBase64(file);
      const items = await detectItems(dataUrl, file.type || 'image/jpeg');
      const top = items[0];
      if (top) {
        if (!name.trim()) setName(top.name);
        const cat = mapDetectedCategory(top.category);
        setCategory(cat);
        if (typeof top.quantityPct === 'number') {
          setQuantityPct(Math.round(top.quantityPct));
        }
        const photoNote = [top.freshnessNote, top.expirationNote].filter(Boolean).join(' ');
        setVisualAnalysis(photoNote);
        if (expirySource === 'estimated') {
          setExpiryDate(estimateExpiryDate(purchaseDate, cat));
          setEstimateInfo(initialEstimate(cat, shelfId));
          void refineEstimate(purchaseDate, cat, shelfId, undefined, photoNote);
        }
        setScanMsg(`Recognized: ${top.name}`);
      } else {
        setScanMsg('No item recognized — fill in manually.');
      }
    } catch (err) {
      setScanMsg(aiErrorMessage(err));
    } finally {
      setScanning(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) return;
    const now = Date.now();
    const payload = {
      name: name.trim(),
      category,
      shelfId,
      photoBlob,
      quantityPct,
      purchaseDate,
      expiryDate,
      expirySource,
      conditionNotes: conditionNotes.trim() || undefined,
      lowStockThresholdPct,
      updatedAt: now,
    };

    if (isEdit) {
      await db.items.update(Number(itemId), payload);
    } else {
      await db.items.add(withUid({ ...payload, createdAt: now }));
    }
    navigate(-1);
  }

  async function handleDelete() {
    if (!isEdit) return;
    await db.items.delete(Number(itemId));
    navigate('/items');
  }

  return (
    <div>
      <header className="bg-bg flex items-center gap-2 w-full px-5 py-3 max-w-2xl mx-auto sticky top-0 z-40">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="text-text">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-semibold text-text">{isEdit ? 'Edit Item' : 'Add to Pantry'}</h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-2 pb-28 flex flex-col gap-5">
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-4 cursor-pointer">
          <PhotoThumb blob={photoBlob} alt={name || 'item photo'} className="w-32 h-32 rounded-xl" />
          <span className="text-sm text-primary font-medium flex items-center gap-1">
            <Icon name="photo_camera" /> {photoBlob ? 'Retake photo' : 'Take photo'}
          </span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
        </label>

        <div className="bg-primary-soft/35 border border-primary-soft rounded-2xl p-4 flex items-start gap-3">
          <Icon name="center_focus_strong" className="text-primary shrink-0" />
          <p className="text-sm leading-relaxed text-text-muted">
            For better analysis, scan or upload a clear food photo. AI can identify the item,
            category, quantity, and visible freshness clues; manual entry only uses category and
            storage estimates.
          </p>
        </div>

        {scanning && (
          <p className="text-sm text-primary text-center flex items-center justify-center gap-2">
            <Icon name="auto_awesome" /> Scanning photo…
          </p>
        )}
        {!scanning && scanMsg && (
          <p className="text-sm text-text-muted text-center flex items-center justify-center gap-1.5">
            <Icon name="check_circle" className="text-primary" /> {scanMsg}
          </p>
        )}

        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Carton of milk"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Storage Location">
          <select
            value={shelfId}
            onChange={(e) => handleShelfChange(e.target.value as ShelfId)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
          >
            {SHELF_SEED.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Quantity — ${quantityPct}% left`}>
          <input
            type="range"
            min={0}
            max={100}
            value={quantityPct}
            onChange={(e) => setQuantityPct(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </Field>

        <Field label={`Low-stock alert below — ${lowStockThresholdPct}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={lowStockThresholdPct}
            onChange={(e) => setLowStockThresholdPct(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </Field>

        <Field label="Purchased On">
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => handlePurchaseDateChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field label="Condition notes">
          <div className="flex flex-col gap-2">
            <textarea
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              onBlur={handleConditionNotesBlur}
              placeholder="e.g. opened yesterday, sealed, smells off, mold visible"
              rows={3}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {CONDITION_HINTS.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => appendConditionNote(note)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-muted"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field
          label={
            <span className="flex items-center gap-2">
              Expiry Date
              {expirySource === 'estimated' && (
                <span className="text-xs font-semibold text-accent bg-warn-soft px-2 py-0.5 rounded-full">
                  ESTIMATED
                </span>
              )}
            </span>
          }
        >
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => handleExpiryDateChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </Field>

        <ExpiryAnalysis
          expirySource={expirySource}
          estimateInfo={estimateInfo}
          visualAnalysis={visualAnalysis}
          conditionNotes={conditionNotes}
          hasPhoto={Boolean(photoBlob)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-primary text-white font-semibold rounded-xl py-3.5 mt-2"
        >
          Save to Fridge
        </button>

        {isEdit && (
          <button onClick={handleDelete} className="w-full text-danger font-semibold py-2">
            Delete item
          </button>
        )}
      </main>
    </div>
  );
}

function ExpiryAnalysis({
  expirySource,
  estimateInfo,
  visualAnalysis,
  conditionNotes,
  hasPhoto,
}: {
  expirySource: ExpirySource;
  estimateInfo: EstimateInfo;
  visualAnalysis: string | null;
  conditionNotes: string;
  hasPhoto: boolean;
}) {
  const data = estimateInfo.dataSource ?? 'local estimate';
  const sourceLabel =
    estimateInfo.source === 'foodkeeper+ai'
      ? `${data} + AI review`
      : estimateInfo.source === 'foodkeeper'
        ? data
        : 'local category fallback';
  const adjusted =
    estimateInfo.baselineDays !== undefined && estimateInfo.baselineDays !== estimateInfo.days;
  const rangeText =
    estimateInfo.baselineMinDays !== undefined &&
    estimateInfo.baselineMaxDays !== undefined &&
    estimateInfo.baselineMinDays !== estimateInfo.baselineMaxDays
      ? `${estimateInfo.baselineMinDays}–${estimateInfo.baselineMaxDays} days`
      : undefined;
  return (
    <div className="animate-in bg-surface border border-border rounded-2xl p-4 card-shadow">
      <div className="flex items-center justify-between gap-2 text-text font-semibold">
        <span className="flex items-center gap-2">
          <Icon name="psychology" className="text-primary" filled />
          Expiry analysis
        </span>
        {estimateInfo.analyzing ? (
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            <Icon name="auto_awesome" /> Analyzing…
          </span>
        ) : (
          expirySource === 'estimated' &&
          estimateInfo.confidence && (
            <span className="text-xs font-semibold text-text-muted capitalize bg-bg px-2 py-0.5 rounded-full">
              {estimateInfo.confidence} confidence
            </span>
          )
        )}
      </div>

      {expirySource === 'manual' ? (
        <p className="text-sm leading-relaxed text-text-muted mt-2">
          You manually set this date, so PantrySnap will not override it.
        </p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-text-muted mt-2">
            Estimated as purchase date + {estimateInfo.days} days for {estimateInfo.category} stored
            in {estimateInfo.storage}.
            {rangeText && ` Typical range ${rangeText}.`}
            {adjusted && ` Baseline ${estimateInfo.baselineDays} days, adjusted for condition.`}{' '}
            Source: {sourceLabel}.
          </p>
          {estimateInfo.reasoning && estimateInfo.reasoning.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {estimateInfo.reasoning.map((r, i) => (
                <li key={i} className="text-sm leading-relaxed text-text-muted flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="text-sm leading-relaxed text-text-muted mt-2">
        {visualAnalysis ||
          (hasPhoto
            ? 'Photo saved. Sign in and rescan if you want AI to describe visible freshness clues.'
            : 'No photo analysis yet. A clear photo helps AI detect the food type and visible condition, which can make the estimate easier to review.')}
      </p>
      {conditionNotes.trim() && (
        <p className="text-sm leading-relaxed text-accent-dark mt-2">
          User notes to consider: {conditionNotes.trim()}
        </p>
      )}
      {estimateInfo.safetyNote && expirySource !== 'manual' && (
        <p className="text-sm leading-relaxed text-danger mt-2 flex gap-2">
          <Icon name="warning" className="shrink-0" />
          <span>{estimateInfo.safetyNote}</span>
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      {children}
    </div>
  );
}
