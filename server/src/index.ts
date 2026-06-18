// PantrySnap proxy — local dev entrypoint.
// Routes + middleware live in app.ts (listener-free) so the same app runs both
// here (Node listener) and as a Vercel serverless function (api/index.ts).
import { serve } from '@hono/node-server';
import app from './app.js';

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`PantrySnap data layer on http://localhost:${info.port}`);
});

export default app;
