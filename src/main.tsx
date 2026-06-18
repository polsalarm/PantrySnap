import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureShelvesSeeded } from './lib/db'
import { startExpiryNotificationChecks } from './lib/notifications'

ensureShelvesSeeded();
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
