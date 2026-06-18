// Vercel serverless entrypoint. Reuses the listener-free Hono app from src/app.ts.
// Local dev still uses src/index.ts (Node listener); this file is only invoked
// by Vercel's runtime, which adapts the request via hono/vercel.
import { handle } from 'hono/vercel';
import app from '../src/app.js';

export const config = { runtime: 'nodejs' };

export default handle(app);
