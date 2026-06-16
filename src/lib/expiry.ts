export type ExpiryStatus = 'fresh' | 'soon' | 'expired';

const SOON_THRESHOLD_DAYS = 3;

export function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function expiryStatus(dateIso: string): ExpiryStatus {
  const days = daysUntil(dateIso);
  if (days < 0) return 'expired';
  if (days <= SOON_THRESHOLD_DAYS) return 'soon';
  return 'fresh';
}

export function expiryLabel(dateIso: string): string {
  const days = daysUntil(dateIso);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Use by today';
  if (days === 1) return 'Use by tomorrow';
  return `Expiring in ${days} days`;
}

// Lightweight category shelf-life table (placeholder for Phase 5's USDA FoodKeeper dataset).
const CATEGORY_SHELF_LIFE_DAYS: Record<string, number> = {
  dairy: 10,
  meat: 4,
  seafood: 2,
  produce: 7,
  leftovers: 4,
  condiments: 180,
  bakery: 5,
  beverages: 14,
  frozen: 90,
  pantry: 270,
  other: 7,
};

export function estimateShelfLifeDays(category: string): number {
  return CATEGORY_SHELF_LIFE_DAYS[category] ?? CATEGORY_SHELF_LIFE_DAYS.other;
}

export function estimateExpiryDate(purchaseDateIso: string, category: string): string {
  const shelfLifeDays = estimateShelfLifeDays(category);
  const purchase = new Date(purchaseDateIso);
  purchase.setDate(purchase.getDate() + shelfLifeDays);
  return purchase.toISOString().slice(0, 10);
}

export const CATEGORIES = Object.keys(CATEGORY_SHELF_LIFE_DAYS);
