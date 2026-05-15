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
- `/[lang]/bottles/` and `/[lang]/bottles/[id]` — Bottle catalog + detail
- `/[lang]/caps/` and `/[lang]/caps/[id]` — Cap catalog + detail
- `/[lang]/about/` — About page

### Internationalisation
All UI strings live in `src/lib/dictionary.ts` as a single nested object keyed by locale. Access via the `useLang()` hook:

```tsx
const { lang, dict } = useLang();
dict.catalog.product_detail.quantity
```

Never hardcode UI strings — always use `dict.*`.

### Data
Product catalog is static local data in `src/data/products.ts`. No API or database. Filtering/sorting is done client-side via `src/lib/catalogUtils.ts` and the `useCatalogFilters` hook (state stored in URL query params).

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
