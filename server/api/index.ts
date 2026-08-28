// Vercel serverless entrypoint. Reuses the listener-free Hono app from src/app.ts.
// Local dev still uses src/index.ts (Node listener); this file is only invoked
// by Vercel's runtime, which adapts the request via hono/vercel.
//
// Vercel's Node runtime treats `export default` as the classic (req, res) => void
// signature — a returned Response is silently discarded (logged as a WARN) and
// the request hangs until timeout. A named `fetch` export is required to opt into
// the Web Fetch API signature Hono actually produces.
import { handle } from 'hono/vercel';
import app from '../src/app.js';

export const config = { runtime: 'nodejs' };

export const fetch = handle(app);
