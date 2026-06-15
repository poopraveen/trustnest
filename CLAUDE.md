# TrustNest — Project Memory

## Project Overview
TrustNest is a Next.js 14 (App Router) monorepo with 13 distinct platform routes, all living under `app/[locale]/`. Tech stack: TypeScript, Tailwind CSS, Prisma, NextAuth, Zustand, next-intl.

## Active Routes / Projects

| Route | Description |
|-------|-------------|
| `/` | TrustNest home — Tamil Nadu govt public finance platform |
| `/expenditure` `/scorecards` `/projects` `/schemes` `/grievances` `/tenders` | TNVettri govt finance dashboard (green-nav) |
| `/wifi-posture` | WiFi security audit tool |
| `/mesh-chat` | P2P mesh messaging |
| `/object-detect` | Real-time object detection (browser camera) |
| `/chemverse` | Chemistry learning: interactive periodic table, AI tutor, equation balancer, dashboard |
| `/majestor` | Majestronicz electronics AI workshop — pick components, get GPT-4o mini project ideas |
| `/dating` | Dating platform (divorce-friendly) |
| `/hbl` | Health/Business Loyalty — QR check-in, points, admin |
| `/ward-election` | Ward election campaign manager |
| `/veppampattu` | Community platform |
| `/(realestate)` | Real estate marketplace + seller portal |

## Key Files
- `components/Navbar.tsx` — Main TrustNest nav (green gov bar). All new routes get a link here.
- `lib/majestor/products.ts` — 17 electronics products, 10 collections
- `lib/majestor/store.ts` — Zustand cart + search stores (persisted to localStorage)
- `app/api/majestor/workshop/route.ts` — GPT-4o mini streaming, mock fallback when no API key
- `components/chemverse/` — BohrModel.tsx, ElementModal.tsx, PeriodicTable.tsx
- `lib/chemverse/elements.ts` — 118 elements; CATEGORY_COLORS must use CSS rgba/hex (NOT Tailwind classes)

## Design System — Majestor
- Background: `#0a0c10` (dark navy)
- Accent: `#00e5a0` (green)
- Fonts: Syne (headings) + DM Sans (body), loaded via `next/font/google` in `app/[locale]/majestor/layout.tsx`

## Design System — ChemVerse
- Background: `#0f1117`, accent: `#22c55e` (green), secondary: `#6366f1` (indigo)

## Design System — TNVettri (main nav)
- Nav background: `green-800`, accent amber, text white

## Important Patterns
- New top-level route → add layout.tsx + page.tsx under `app/[locale]/<route>/`
- Add nav link to `components/Navbar.tsx` (desktop `GovNavLink` + mobile `Link` block)
- AI streaming: use `ReadableStream` + `text/event-stream` with `data: ${JSON.stringify({ text })}\n\n`
- All ChemVerse heavy components use dynamic import with `ssr: false`
- Cart persists to localStorage key `"majestor-cart"` via Zustand persist middleware



## Context Memory
_Last compacted: 2026-06-08 17:30_

Test summary after fix.

## Recent Changes
- `/(tnvettri)/capability-intelligence` — modified 2026-06-15 06:37
- `/one-spot-bangles3` — modified 2026-06-14 12:57
- `/family-trip` — modified 2026-06-13 04:35
- `/family-trip` — modified 2026-06-13 04:28
- `/family-trip` — modified 2026-06-13 04:05
- `/family-trip` — modified 2026-06-13 03:58
- `/townhall-profile` — modified 2026-06-11 09:46
- `/print3d` — modified 2026-06-09 08:08
- `/majestor/checkout` — modified 2026-06-08 17:32
