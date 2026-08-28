import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureItemsSeeded, ensureShelvesSeeded } from './lib/db'
import { startExpiryNotificationChecks } from './lib/notifications'

void ensureShelvesSeeded().then(() => ensureItemsSeeded());
startExpiryNotificationChecks();

// Ask the browser to keep our local data (IndexedDB) from being evicted —
// important for free/local-first users who have no cloud backup.
if (navigator.storage?.persist) {
  navigator.storage.persisted().then((p) => {
    if (!p) navigator.storage.persist();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
