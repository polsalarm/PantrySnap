import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, SHELF_SEED, type ExpirySource, type ShelfId } from '../lib/db';
import { CATEGORIES, estimateExpiryDate } from '../lib/expiry';
import { fetchShelfLife, type Storage } from '../lib/api';
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
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(undefined);

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
      setPhotoBlob(item.photoBlob);
    });
  }, [isEdit, itemId]);

  // Refine an estimated expiry from the Phase 5 data layer (USDA FoodKeeper).
  // Instant local estimate stays as the offline fallback; backend overrides it when reachable.
  async function refineEstimate(purchase: string, cat: string, shelf: ShelfId) {
    const res = await fetchShelfLife(cat, storageForShelf(shelf));
    if (res) setExpiryDate(addDays(purchase, res.days));
  }

  function handlePurchaseDateChange(value: string) {
    setPurchaseDate(value);
    if (expirySource === 'estimated') {
      setExpiryDate(estimateExpiryDate(value, category));
      void refineEstimate(value, category, shelfId);
    }
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    if (expirySource === 'estimated') {
      setExpiryDate(estimateExpiryDate(purchaseDate, value));
      void refineEstimate(purchaseDate, value, shelfId);
    }
  }

  function handleShelfChange(value: ShelfId) {
    setShelfId(value);
    if (expirySource === 'estimated') void refineEstimate(purchaseDate, category, value);
  }

  function handleExpiryDateChange(value: string) {
    setExpiryDate(value);
    setExpirySource('manual');
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoBlob(file);
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
      lowStockThresholdPct,
      updatedAt: now,
    };

    if (isEdit) {
      await db.items.update(Number(itemId), payload);
    } else {
      await db.items.add({ ...payload, createdAt: now });
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
        <button onClick={() => navigate(-1)} className="text-text">
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

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      {children}
    </div>
  );
}
