# StrategyAI — AI Website Strategy & Growth Analyzer

A premium AI SaaS web app that analyzes any website's SEO, content, competitors, and user experience, delivering a complete growth strategy report in seconds.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ai-analyzer run dev` — run the frontend (port 24697)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, Framer Motion, wouter, @tanstack/react-query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Scraping: cheerio
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all endpoints)
- `lib/api-zod/` — generated Zod schemas from OpenAPI
- `lib/api-client-react/` — generated React Query hooks from OpenAPI
- `lib/db/src/schema/analyses.ts` — Drizzle DB schema
- `artifacts/api-server/src/routes/analyses.ts` — all API route handlers
- `artifacts/api-server/src/services/analyzer.ts` — scraping + AI data generation logic
- `artifacts/ai-analyzer/src/pages/` — React pages (home, analysis, demo, history)
- `artifacts/ai-analyzer/src/components/` — shared components (nav, footer, score-ring)

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives both Zod validation on the server and React Query hooks on the client — single source of truth for types.
- **Async analysis**: POST /api/analyses returns immediately with `pending` status; background task scrapes + generates data; frontend polls every 2s until `completed`.
- **JSONB module storage**: All six analysis modules (scores, keywords, competitors, content, userflow, recommendations) stored as JSONB columns, served via dedicated sub-routes.
- **Demo endpoint**: `/api/demo` returns pre-generated hardcoded data for instant showcase without DB writes.
- **Dark-first theme**: Electric blue (`hsl(217, 95%, 60%)`) on near-black (`hsl(224, 40%, 4%)`) using CSS custom properties + Tailwind v4.

## Product

Six AI-powered analysis modules delivered in one report:
1. **Overall Scores** — Animated score rings for SEO, UX, Content, Growth with growth impact estimate
2. **Top 5 Recommendations** — Ranked, impact/effort tagged, category-labeled actionable items
3. **Keyword Intelligence** — Primary, long-tail, and opportunity keywords with SEO score bar
4. **Content Improvements** — Expandable accordion of prioritized suggestions with expected impact
5. **Competitor Analysis** — Strengths/weaknesses vs named competitors with CTA/Content/UX scores
6. **User Flow Analysis** — Conversion journey steps, friction points, UX/Mobile/Accessibility scores

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do not run `pnpm dev` at workspace root — use workflows or `--filter` flag
- After editing `openapi.yaml`, always run codegen before typechecking
- Frontend pages import hooks from `@workspace/api-client-react` (never relative paths)
- The `getGetAnalysisQueryKey` import is needed alongside `useGetAnalysis` for the refetchInterval pattern with explicit queryKey

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
