import { db } from './db';
import { expiryStatus } from './expiry';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

const CHECK_INTERVAL_MS = 1000 * 60 * 60; // hourly
const NOTIFIED_KEY = 'pantrysnap-notified-ids';

function getNotifiedIds(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<number>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
}

async function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const items = await db.items.toArray();
  const notified = getNotifiedIds();

  for (const item of items) {
    if (!item.id || notified.has(item.id)) continue;
    const status = expiryStatus(item.expiryDate);
    const isLowStock = item.quantityPct <= item.lowStockThresholdPct;

    if (status === 'soon' || status === 'expired') {
      new Notification('PantrySnap — Expiring soon', { body: `${item.name} needs attention.` });
      notified.add(item.id);
    } else if (isLowStock) {
      new Notification('PantrySnap — Low stock', { body: `${item.name} is running low.` });
      notified.add(item.id);
    }
  }

  saveNotifiedIds(notified);
}

export function startExpiryNotificationChecks() {
  checkAndNotify();
  setInterval(checkAndNotify, CHECK_INTERVAL_MS);
}
