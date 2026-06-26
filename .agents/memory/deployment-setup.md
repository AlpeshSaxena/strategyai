---
name: Deployment setup
description: Vercel and Netlify deployment configs; build quirks; bundle optimization decisions.
---

## Vercel deployment
- `vercel.json` at repo root; buildCommand: `pnpm install && BASE_PATH=/ pnpm --filter @workspace/ai-analyzer run build`
- outputDirectory: `artifacts/ai-analyzer/dist/public`
- `api/handler.ts` — self-contained Express server (no workspace lib deps), synchronous analysis, in-memory store. Deployed as Vercel Function (maxDuration: 30s). Rewrites `/api/(.*)` → `/api/handler`.
- `api/package.json` is a workspace member; its deps (express, cors, cheerio) are in `api/node_modules`.

## Netlify deployment
- `netlify.toml` at repo root; same build command; publish dir `artifacts/ai-analyzer/dist/public`
- `netlify/functions/handler.ts` uses `serverless-http` (v3) to wrap the same `api/handler.ts` Express app — clean 2-line adapter.
- `serverless-http` lives in root `package.json` dependencies so Netlify's esbuild bundler can resolve it.

## Build quirks
- `vite.config.ts` must default `PORT` to `3000` and `BASE_PATH` to `/` (not throw) — cloud builds run without those env vars.
- Replit plugins loaded as conditional dynamic imports: `if (process.env.REPL_ID)`.
- `lib/db/src/index.ts` uses lazy Proxy init — no throw at module load if DATABASE_URL is absent.

## Bundle optimization
- jsPDF + html2canvas + docx (≈750KB) are lazy-loaded via `React.lazy()` in analysis.tsx and demo.tsx.
- Main initial chunk dropped from ~1.27MB → ~516KB (59% reduction).
- `<Suspense fallback={null}>` wraps `<DownloadReport>` — silently loads on demand.

**Why:** Cloud deployment build environments don't provide Replit-specific env vars; the lazy-load prevents the large PDF library from blocking initial page load.
