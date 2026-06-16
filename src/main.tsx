import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureShelvesSeeded } from './lib/db'
import { startExpiryNotificationChecks } from './lib/notifications'

ensureShelvesSeeded();
startExpiryNotificationChecks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
