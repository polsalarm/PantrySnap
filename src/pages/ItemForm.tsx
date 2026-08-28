import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, Sparkles, X } from 'lucide-react';
import { db, SHELF_SEED, withUid, type ExpirySource, type ShelfId } from '../lib/db';
import { CATEGORIES, estimateExpiryDate, estimateShelfLifeDays } from '../lib/expiry';
import { analyzeExpiry, detectItems, blobToBase64, aiErrorMessage, type Storage } from '../lib/api';
import { useAuth } from '../lib/useAuth';
import PhotoThumb from '../components/PhotoThumb';
import { DynamicFoodIcon } from '../components/FoodIcons';

const today = () => new Date().toISOString().slice(0, 10);

// Shelf → storage class for shelf-life lookup. Freezer must map to "freezer":
// frozen shelf life is an order of magnitude longer than chilled, so falling
// through to "fridge" would badly under-estimate every frozen item's expiry.
const storageForShelf = (shelfId: ShelfId): Storage =>
  shelfId === 'pantry' ? 'pantry' : shelfId === 'freezer' ? 'freezer' : 'fridge';

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
  const nameRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shelfId, setShelfId] = useState<ShelfId>('middle');
  const [quantityPct, setQuantityPct] = useState(100);
  const [lowStockThresholdPct, setLowStockThresholdPct] = useState(20);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(estimateExpiryDate(today(), CATEGORIES[0]));
  const [expirySource, setExpirySource] = useState<ExpirySource>('estimated');
  const [conditionNotes, setConditionNotes] = useState('');
  const [photos, setPhotos] = useState<Blob[]>([]);
  const primaryPhoto = photos[0];
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
      setPhotos(item.photoBlob ? [item.photoBlob] : []);
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

  async function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow picking the same file again
    if (files.length === 0) return;
    const next = [...photos, ...files].slice(0, 4); // cap at 4 angles
    setPhotos(next);
    setVisualAnalysis(null);

    // AI auto-detect needs sign-in — skip the guaranteed-401 call, hint instead.
    if (aiLocked) {
      setScanMsg('Sign in (Account) to auto-fill and analyze items from the photo.');
      return;
    }
    await scanPhotos(next);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  // AI scan over all angle photos at once — more angles = more accurate ID.
  async function scanPhotos(blobs: Blob[]) {
    if (blobs.length === 0) return;
    setScanning(true);
    setScanMsg(null);
    try {
      const imgs = await Promise.all(
        blobs.map(async (b) => ({
          imageBase64: await blobToBase64(b),
          mimeType: b.type || 'image/jpeg',
        })),
      );
      const items = await detectItems(imgs);
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
        const conf = typeof top.confidence === 'number' ? top.confidence : undefined;
        const angles = blobs.length > 1 ? ` from ${blobs.length} angles` : '';
        if (conf !== undefined && conf < 0.6) {
          setScanMsg(
            `Recognized "${top.name}" but not confident (${Math.round(conf * 100)}%)${angles}. ` +
              'Add another angle, or retake closer in better light for a more accurate scan.',
          );
        } else {
          setScanMsg(
            `Recognized: ${top.name}${conf !== undefined ? ` (${Math.round(conf * 100)}% confident)` : ''}${angles}`,
          );
        }
      } else {
        setScanMsg(
          'No item recognized — add another angle with good lighting, or fill in manually.',
        );
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
      photoBlob: photos[0],
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

  const shelfName = SHELF_SEED.find((s) => s.id === shelfId)?.name ?? shelfId;
  const subtitle = [category, shelfName, `${quantityPct}% left`].join(', ');
  const noteAdded = (hint: string) =>
    conditionNotes
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .includes(hint.toLowerCase());

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Hero photo — tap to capture. A photo (or typed name) identifies the item. */}
        <div className="relative h-[38%] min-h-[220px] max-h-[280px] bg-[var(--color-tint-cool)] border-b-[3px] border-ink">
          <div className="absolute inset-0">
            {primaryPhoto ? (
              <PhotoThumb
                blob={primaryPhoto}
                alt={name || 'item photo'}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink pointer-events-none px-6">
                {name.trim() ? (
                  <DynamicFoodIcon name={name} size={108} />
                ) : (
                  <Camera size={48} strokeWidth={2} className="text-ink/55" />
                )}
                <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                  <Camera size={16} strokeWidth={2.25} />
                  Tap to take a photo
                </span>
                <span className="text-[11px] font-semibold text-ink-soft text-center">
                  {isEdit ? 'Replace this item’s photo' : 'A photo fills in the name, category, and freshness'}
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              aria-label="Take a photo of this item"
              className="absolute inset-0 z-[1] w-full h-full cursor-pointer opacity-0"
              onChange={handleAddPhotos}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-4 left-4 z-10 size-10 grid place-items-center rounded-full bg-white text-ink border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        </div>

        {photos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-5 -mt-7 relative z-10 pb-1">
            {photos.map((b, i) => (
              <div key={i} className="relative">
                <PhotoThumb
                  blob={b}
                  alt={`angle ${i + 1}`}
                  className="size-14 rounded-lg border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove angle ${i + 1}`}
                  className="absolute -top-1.5 -right-1.5 bg-white border-2 border-ink rounded-full size-5 grid place-items-center text-ink"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="size-14 rounded-lg border-2 border-dashed border-ink bg-white flex flex-col items-center justify-center cursor-pointer text-ink text-[10px] font-extrabold shadow-[3px_3px_0_var(--color-ink)]">
                <Camera size={16} />
                Angle
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={handleAddPhotos}
                />
              </label>
            )}
            {photos.length > 1 && !aiLocked && (
              <button
                type="button"
                onClick={() => void scanPhotos(photos)}
                disabled={scanning}
                className="text-xs text-primary font-extrabold flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles size={14} /> Rescan
              </button>
            )}
          </div>
        )}

        <div className="px-6 pt-3 pb-3 text-center">
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            aria-label="Name"
            className="w-full text-center text-[26px] font-extrabold text-ink tracking-[-0.4px] placeholder:text-ink/25 outline-none bg-transparent"
          />
          <p className="mt-2 text-[13px] font-semibold text-ink-soft capitalize leading-snug">
            {subtitle}
          </p>
        </div>

        <div className="mx-6 border-t-[3px] border-ink" />

        {(scanning || scanMsg) && (
          <p className="px-6 pt-3 text-[13px] font-semibold text-ink-soft text-center">
            {scanning ? 'Scanning photo…' : scanMsg}
          </p>
        )}

        <p className="px-6 pt-2 text-[11px] font-semibold leading-snug text-ink-soft">
          For better analysis, center one item in a clear, well-lit photo and keep labels facing the
          camera. AI identifies the item, category, quantity, and visible freshness clues. Add a few
          angles (front, label, top) for a more accurate scan; if it guesses wrong, retake closer or
          remove a blurry angle. Manual entry only uses category and storage estimates.
        </p>

        <section className="mx-5 mt-3 card-plate px-4 py-2">
          <h2 className="text-[17px] font-extrabold text-ink pt-2 mb-1">Details</h2>
          <ExtraRow label="Category">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-transparent text-right text-[15px] font-bold text-ink outline-none capitalize appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </ExtraRow>
          <ExtraRow label="Storage">
            <select
              value={shelfId}
              onChange={(e) => handleShelfChange(e.target.value as ShelfId)}
              className="bg-transparent text-right text-[15px] font-bold text-ink outline-none appearance-none"
            >
              {SHELF_SEED.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </ExtraRow>
          <ExtraRow label="Purchased">
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => handlePurchaseDateChange(e.target.value)}
              className="bg-transparent text-right text-[15px] font-bold text-ink outline-none"
            />
          </ExtraRow>
          <ExtraRow
            label={
              <span className="flex items-center gap-2">
                Expiry
                {expirySource === 'estimated' && (
                  <span className="text-[10px] font-extrabold text-accent-dark bg-warn-soft border-2 border-ink px-1.5 py-0.5 rounded-full">
                    EST
                  </span>
                )}
              </span>
            }
          >
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              className="bg-transparent text-right text-[15px] font-bold text-ink outline-none"
            />
          </ExtraRow>
        </section>

        <section className="mx-5 mt-3 card-plate px-4 py-4">
          <h2 className="text-[17px] font-extrabold text-ink mb-3">Stock</h2>
          <label className="block text-[15px] font-bold text-ink mb-1.5">
            Quantity — {quantityPct}% left
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={quantityPct}
            onChange={(e) => setQuantityPct(Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
          <label className="block text-[15px] font-bold text-ink mt-4 mb-1.5">
            Low-stock alert below — {lowStockThresholdPct}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={lowStockThresholdPct}
            onChange={(e) => setLowStockThresholdPct(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </section>

        <section className="mx-5 mt-3 card-plate px-4 py-2">
          <h2 className="text-[17px] font-extrabold text-ink pt-2 mb-1">Extra</h2>
          {CONDITION_HINTS.map((note) => (
            <div
              key={note}
              className="flex items-center justify-between py-3 border-b-2 border-ink/10 last:border-0"
            >
              <span className="text-[15px] font-bold text-ink">{note}</span>
              <button
                type="button"
                onClick={() => appendConditionNote(note)}
                disabled={noteAdded(note)}
                aria-label={`Add ${note}`}
                className="size-8 rounded-full bg-primary text-white border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] grid place-items-center disabled:opacity-35"
              >
                <Plus size={16} strokeWidth={2.75} />
              </button>
            </div>
          ))}
        </section>

        <section className="mx-5 mt-3 card-plate px-4 py-4">
          <h2 className="text-[17px] font-extrabold text-ink mb-2">Note</h2>
          <textarea
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            onBlur={handleConditionNotesBlur}
            placeholder="e.g. opened yesterday, sealed, smells off, mold visible"
            rows={4}
            className="w-full bg-bg border-2 border-ink rounded-xl px-4 py-3 text-[14px] font-semibold text-ink placeholder:text-ink/35 outline-none resize-none"
          />
        </section>

        <div className="px-5 pt-4 pb-8">
          <ExpiryAnalysis
            expirySource={expirySource}
            estimateInfo={estimateInfo}
            visualAnalysis={visualAnalysis}
            conditionNotes={conditionNotes}
            hasPhoto={photos.length > 0}
          />
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-5 bg-bg">
        <button
          type="button"
          onClick={() => {
            if (!name.trim()) {
              nameRef.current?.focus();
              return;
            }
            void handleSave();
          }}
          disabled={!name.trim()}
          className="btn-meatball w-full rounded-2xl py-4 px-5 flex items-center justify-between border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] disabled:opacity-40"
        >
          <span>{isEdit ? 'Save changes' : 'Add to pantry'}</span>
          <span>{formatShortDate(expiryDate)}</span>
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-danger font-extrabold py-3 text-sm"
          >
            Delete item
          </button>
        )}
      </div>
    </div>
  );
}

function ExtraRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b-2 border-ink/10 last:border-0">
      <span className="text-[15px] font-bold text-ink shrink-0">{label}</span>
      {children}
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
    <div className="card-plate p-4">
      <div className="flex items-center justify-between gap-2 text-ink font-extrabold text-[15px]">
        <span>Expiry analysis</span>
        {estimateInfo.analyzing ? (
          <span className="text-xs font-extrabold text-primary">Analyzing…</span>
        ) : (
          expirySource === 'estimated' &&
          estimateInfo.confidence && (
            <span className="text-xs font-extrabold text-ink-soft capitalize border-2 border-ink rounded-full px-2 py-0.5">
              {estimateInfo.confidence} confidence
            </span>
          )
        )}
      </div>

      {expirySource === 'manual' ? (
        <p className="text-[13px] font-semibold leading-relaxed text-ink-soft mt-2">
          You manually set this date, so PantrySnap will not override it.
        </p>
      ) : (
        <>
          <p className="text-[13px] font-semibold leading-relaxed text-ink-soft mt-2">
            Estimated as purchase date + {estimateInfo.days} days for {estimateInfo.category} stored
            in {estimateInfo.storage}.
            {rangeText && ` Typical range ${rangeText}.`}
            {adjusted && ` Baseline ${estimateInfo.baselineDays} days, adjusted for condition.`}{' '}
            Source: {sourceLabel}.
          </p>
          {estimateInfo.reasoning && estimateInfo.reasoning.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {estimateInfo.reasoning.map((r, i) => (
                <li key={i} className="text-[13px] font-semibold leading-relaxed text-ink-soft flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="text-[13px] font-semibold leading-relaxed text-ink-soft mt-2">
        {visualAnalysis ||
          (hasPhoto
            ? 'Photo saved. Sign in and rescan if you want AI to describe visible freshness clues.'
            : 'No photo analysis yet. A clear photo helps AI detect the food type and visible condition, which can make the estimate easier to review.')}
      </p>
      {conditionNotes.trim() && (
        <p className="text-[13px] font-semibold leading-relaxed text-accent-dark mt-2">
          User notes to consider: {conditionNotes.trim()}
        </p>
      )}
      {estimateInfo.safetyNote && expirySource !== 'manual' && (
        <p className="text-[13px] font-semibold leading-relaxed text-danger mt-2">
          {estimateInfo.safetyNote}
        </p>
      )}
    </div>
  );
}
