# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build (standalone output)
npm run lint      # Run ESLint
npm start         # Run production server
```

No test framework is configured.

## Architecture

### Routing
Next.js 14 App Router with a mandatory `[lang]` dynamic segment. All pages live under `src/app/[lang]/`. Middleware (`src/middleware.ts`) redirects `/` → `/en`. Valid locales: `en`, `id`.

Routes:
- `/[lang]/` — Home
- `/[lang]/products/` — Catalog landing
- `/[lang]/products/bottles/`, `/[lang]/products/caps/`, `/[lang]/products/pot/` — Family catalogs
- `/[lang]/products/[slug]` — Product detail (canonical; the per-family `[slug]` routes redirect here)
- `/[lang]/compare` — Side-by-side comparison of configured products
- `/[lang]/about/` — About page

### Internationalisation
All UI strings live in `src/lib/dictionary.ts` as a single nested object keyed by locale. Access via the `useLang()` hook:

```tsx
const { lang, dict } = useLang();
dict.catalog.product_detail.quantity
```

Never hardcode UI strings — always use `dict.*`.

### Data
The product catalog comes from the OLEW backend via `src/lib/publicApi.ts` (all `/api/v1/public/*` endpoints, `NEXT_PUBLIC_API_BASE_URL`). Every fetcher swallows errors and returns an empty result rather than throwing, so a page renders empty instead of crashing.

`src/data/products.ts` is legacy static data still imported by `FilterSidebar.tsx` only — don't build new features on it.

Filtering/sorting is client-side via `src/lib/catalogUtils.ts` and the `useCatalogFilters` hook (state stored in URL query params).

### Product taxonomy & assembly slots

Two separate concerns, both name-based because the API exposes no structural flag:

**`src/lib/productTaxonomy.ts`** — which catalog page a product lists on (`bottle` / `cap` / `pot`). Pot *components* are explicitly excluded (`isAssemblyPart`): they're configurator-only options, not shoppable products. Match on exact type/category names in both locales — the loose substring matcher would otherwise file "Outer Cap"/"Tutup Luar" under bottle closures, and "Plug"/"Sumbat" matches no keyword at all and would vanish silently.

**`src/lib/productAssembly.ts`** — the pot stacking model, mirroring the admin panel's `src/features/products/slots.ts`. Keep the two in sync.

```
5  Outer Cap   ▲ top
4  Plug
3  Inner Cap
2  Inner Pot
1  Body        ▼ bottom   ← the Pot product itself
```

Slot 1 is the Pot product itself, so only slots 2–5 are selectable. Bottles keep one generic `cap` slot, which is also the fallback bucket for unrecognised types so legacy links stay visible.

**The API returns no slot on the compatibility row** (`CompatibleProduct.role` is advisory and always absent). Slots are derived from each linked product's own type name, so `SlotDef.typeName` must match the backend's seeded product types.

Ordering matters: UI lists use `SLOTS_TOP_DOWN`, but `Product3DViewer` derives each layer's `renderOrder` from its array position, so `layers` must be passed `SLOTS_BOTTOM_UP` — otherwise interpenetrating parts flicker while orbiting.

### Styling
Tailwind CSS only — no CSS modules. Custom utility classes (`.btn-primary`, `.btn-outline`, `.glass`, `.container-custom`, etc.) are defined in `src/app/globals.css`. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) when conditionally applying classes. Dark mode uses Tailwind's `class` strategy via `next-themes`.

### Component conventions
- Mark client components with `'use client'` at the top
- Icons from `lucide-react`
- Animations via `framer-motion` (`motion.button`, `motion.div`, etc.)
- 3D previews use `@react-three/fiber` + `drei`, loaded dynamically (`next/dynamic`) to avoid SSR issues

### Key paths
| Path | Purpose |
|------|---------|
| `src/app/[lang]/layout.tsx` | Per-locale layout, wraps with `LangContext` |
| `src/lib/dictionary.ts` | All i18n strings |
| `src/lib/LangContext.tsx` | `useLang()` hook & provider |
| `src/types/catalog.ts` | `Product`, `FilterState`, category types |
| `src/data/products.ts` | Static product catalog |
| `src/components/catalog/detail/` | Product detail page components |

### Unused dependencies
`@reduxjs/toolkit` and `react-redux` are installed but not used. Don't introduce Redux — use React Context or URL state instead.
