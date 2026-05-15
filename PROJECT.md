# Olew App — Complete Project Documentation

> Read this file at the start of any new development session to fully understand the project without re-exploring the codebase.

---

## Business Overview

**Olew Group** is a premium packaging solutions provider based in Jakarta, Indonesia, founded September 9, 2018. This web app is their product catalog — a bilingual (EN/ID) showcase of customizable bottles and caps for B2B clients.

**Core business:**
- Manufactures and sells packaging: bottles and caps for cosmetics, pharmaceuticals, body care, and perfume industries.
- Differentiators: in-house mold making, custom printing, bulk discounts, multiple certifications (Halal, ISO 9001:2015, GMP, CPKB, SJH).
- 100+ clients, 4+ industries, fully customizable products.
- No e-commerce checkout — the app is a catalog that ends with an **"Add to Inquiry"** flow (quote request via WhatsApp or form).

**Target users:** B2B buyers (cosmetic brands, pharma companies, beauty startups) browsing for packaging solutions.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.0.4 (App Router) |
| Language | TypeScript 5.3.3 |
| UI | React 18.2.0 |
| Styling | Tailwind CSS 3.4.0 |
| Animations | Framer Motion 10.18.0 |
| Icons | Lucide React 0.303.0 |
| Carousel | Embla Carousel 8.0.0 |
| 3D | Three.js 0.160.1 + React Three Fiber 8.18.0 + Drei |
| Color Picker | react-colorful 5.6.1 |
| Theme | next-themes 0.3.0 (dark/light, stored as `olew-theme`) |
| State | React Context + URL query params (Redux installed but unused) |
| Deployment | Docker (standalone Next.js output) |

---

## Project Structure

```
olew-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, meta, theme script
│   │   ├── globals.css                # Tailwind + custom utility classes
│   │   ├── page.tsx                   # Redirects / → /en
│   │   ├── not-found.tsx
│   │   └── [lang]/
│   │       ├── layout.tsx             # Wraps every page with LangProvider
│   │       ├── page.tsx               # Homepage (6 sections)
│   │       ├── about/
│   │       │   ├── page.tsx
│   │       │   └── layout.tsx
│   │       ├── products/
│   │       │   ├── page.tsx           # Products landing (not the catalog)
│   │       │   └── layout.tsx
│   │       ├── bottles/
│   │       │   ├── page.tsx           # Bottles catalog with filters
│   │       │   ├── layout.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx       # Bottle product detail
│   │       │       └── layout.tsx
│   │       └── caps/
│   │           ├── page.tsx           # Caps catalog with filters
│   │           ├── layout.tsx
│   │           └── [id]/
│   │               ├── page.tsx       # Cap product detail
│   │               └── layout.tsx
│   ├── components/
│   │   ├── Providers.tsx              # ThemeProvider wrapper
│   │   ├── layout/
│   │   │   ├── Navigation.tsx         # Sticky navbar, lang switcher, theme toggle
│   │   │   └── Footer.tsx             # Links, contact, newsletter form
│   │   ├── sections/                  # Homepage sections
│   │   │   ├── HeroSection.tsx        # Embla carousel, count-up stats
│   │   │   ├── ShowcaseSection.tsx    # 4 featured collections
│   │   │   ├── ProductsSection.tsx    # 5 industry use cases
│   │   │   ├── CertificatesSection.tsx
│   │   │   ├── ClientsSection.tsx     # Marquee of 12 client brands
│   │   │   └── CTASection.tsx
│   │   ├── catalog/
│   │   │   ├── ProductsLanding.tsx    # /products page hero
│   │   │   ├── CatalogHeader.tsx      # Breadcrumb + page title
│   │   │   ├── CatalogToolbar.tsx     # Search bar + result count + sort
│   │   │   ├── ProductCard.tsx        # Card with image, name, specs, badge
│   │   │   ├── ProductGrid.tsx        # 3-col responsive grid
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── EmptyState.tsx         # Zero-results UI
│   │   │   ├── filters/
│   │   │   │   ├── FilterSidebar.tsx  # Desktop sidebar + mobile drawer
│   │   │   │   ├── FilterSection.tsx  # Collapsible filter group wrapper
│   │   │   │   ├── TypeFilter.tsx     # Checkbox list of product types
│   │   │   │   ├── RangeFilter.tsx    # Min/max numeric inputs
│   │   │   │   ├── PriceFilter.tsx    # (unused/placeholder)
│   │   │   │   └── ActiveFilters.tsx  # Removable active-filter badges
│   │   │   └── detail/
│   │   │       ├── ProductDetailView.tsx  # Main detail page layout
│   │   │       ├── ProductGallery.tsx     # Image gallery/slider
│   │   │       ├── Product3DViewer.tsx    # Three.js GLB viewer
│   │   │       ├── OrderForm.tsx          # Quantity + inquiry button
│   │   │       ├── EnhancedColorPicker.tsx
│   │   │       ├── ColorPicker.tsx        # react-colorful wrapper
│   │   │       └── RelatedProducts.tsx
│   │   ├── about/
│   │   │   └── AboutUs.tsx
│   │   └── shared/
│   │       └── CountUp.tsx            # Animated number counter on scroll
│   ├── lib/
│   │   ├── LangContext.tsx            # useLang() hook + LangProvider
│   │   ├── dictionary.ts              # All EN + ID strings (~2400 lines)
│   │   ├── catalogUtils.ts            # filterProducts, sortProducts, helpers
│   │   └── utils.ts                   # cn() = clsx + tailwind-merge
│   ├── hooks/
│   │   ├── useCatalogFilters.ts       # URL-synced filter state
│   │   └── useDebounce.ts
│   ├── types/
│   │   └── catalog.ts                 # All TypeScript types
│   ├── data/
│   │   └── products.ts                # 18 bottles + 18 caps static data
│   └── middleware.ts                  # Redirects / → /en
├── public/
│   ├── images/
│   │   ├── 3d/                        # base.glb, cap.glb (Three.js models)
│   │   ├── products/
│   │   │   ├── bottles/               # Product images
│   │   │   └── caps/
│   │   ├── banners/
│   │   └── logos/
│   ├── documents/
│   ├── fonts/
│   ├── icons/
│   └── manifest.json
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing

All routes are under `[lang]` — the locale segment is mandatory.

| URL | Page | Component |
|-----|------|-----------|
| `/` | Redirect | → `/en` via middleware |
| `/en` or `/id` | Homepage | `src/app/[lang]/page.tsx` |
| `/en/about` | About | `src/app/[lang]/about/page.tsx` |
| `/en/products` | Products landing | `src/app/[lang]/products/page.tsx` |
| `/en/bottles` | Bottles catalog | `src/app/[lang]/bottles/page.tsx` |
| `/en/bottles/BTL-001` | Bottle detail | `src/app/[lang]/bottles/[id]/page.tsx` |
| `/en/caps` | Caps catalog | `src/app/[lang]/caps/page.tsx` |
| `/en/caps/CAP-001` | Cap detail | `src/app/[lang]/caps/[id]/page.tsx` |

**Middleware** (`src/middleware.ts`): intercepts all non-localized URLs and redirects to `/en/...`. Language switcher in Navigation preserves the current path.

---

## Internationalisation

**Hook:** `useLang()` from `src/lib/LangContext.tsx`

```tsx
const { lang, dict } = useLang();
// lang: 'en' | 'id'
// dict: full dictionary object for current locale
```

**Rule:** Never hardcode UI strings. Always use `dict.*`.

**Dictionary structure** (abridged):

```
dict.nav.home / nav.bottles / nav.caps / nav.about / nav.products
dict.hero.title / hero.cta_primary / hero.slide1_title ...
dict.catalog.filters.type / catalog.filters.weight_range ...
dict.catalog.product_detail.quantity / product_detail.add_to_inquiry ...
dict.about.title / about.mission_items / about.vision_title ...
dict.footer.description / footer.contact_info ...
```

Full strings live in `src/lib/dictionary.ts`. The object is keyed `dictionaries.en` and `dictionaries.id`.

---

## Type System (`src/types/catalog.ts`)

```typescript
type ProductCategory = 'bottle' | 'cap'

type BottleType =
  | 'Dropper Bottle' | 'Pump Bottle' | 'Spray Bottle'
  | 'Roll-on Bottle' | 'Jar' | 'Vial'

type CapType =
  | 'Dropper Cap' | 'Pump Cap' | 'Spray Cap'
  | 'Screw Cap' | 'Flip Cap' | 'Magnetic Cap'

interface ProductDimensions {
  weight: number    // grams
  width: number     // mm
  height: number    // mm
  capacity?: number // ml (bottles only)
}

interface ProductBase {
  id: string
  name: string
  type: BottleType | CapType
  dimensions: ProductDimensions
  image?: string
  colors: string[]
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
}

interface Bottle extends ProductBase { category: 'bottle'; type: BottleType }
interface Cap    extends ProductBase { category: 'cap';    type: CapType    }
type Product = Bottle | Cap

interface FilterState {
  types: string[]
  weightRange: [number, number]
  widthRange:  [number, number]
  heightRange: [number, number]
  searchQuery: string
  sortBy: 'name' | 'newest'
}
```

---

## Product Catalog (`src/data/products.ts`)

**36 total products** — 18 bottles + 18 caps. All data is static (no API/DB).

### Bottles

| ID | Name | Type | Capacity | Colors |
|----|------|------|----------|--------|
| BTL-001 | Amber Dropper Bottle 30ml | Dropper Bottle | 30ml | Amber, Clear, Cobalt Blue |
| BTL-002 | Dropper Bottle 50ml | Dropper Bottle | 50ml | Amber, Green, Clear |
| BTL-003 | Dropper Bottle 100ml | Dropper Bottle | 100ml | Amber, Frosted Clear |
| BTL-004 | Pump Bottle 50ml | Pump Bottle | 50ml | White, Black, Gold |
| BTL-005 | Pump Bottle 100ml | Pump Bottle | 100ml | White, Silver, Rose Gold |
| BTL-006 | Pump Bottle 250ml | Pump Bottle | 250ml | White, Matte Black |
| BTL-007 | Spray Bottle 30ml | Spray Bottle | 30ml | Clear, Amber, Blue |
| BTL-008 | Spray Bottle 60ml | Spray Bottle | 60ml | Clear, Frosted, Black |
| BTL-009 | Spray Bottle 100ml | Spray Bottle | 100ml | Clear, White, Amber |
| BTL-010 | Roll-on Bottle 10ml | Roll-on Bottle | 10ml | Amber, Cobalt Blue, Clear |
| BTL-011 | Roll-on Bottle 15ml | Roll-on Bottle | 15ml | Clear, Frosted, Amber |
| BTL-012 | Roll-on Bottle 30ml | Roll-on Bottle | 30ml | Amber, Green |
| BTL-013 | Glass Jar 30ml | Jar | 30ml | Clear, Frosted, Amber |
| BTL-014 | Glass Jar 50ml | Jar | 50ml | Clear, White, Black |
| BTL-015 | Glass Jar 100ml | Jar | 100ml | Frosted Clear, Amber |
| BTL-016 | Vial 5ml | Vial | 5ml | Clear, Amber |
| BTL-017 | Vial 10ml | Vial | 10ml | Clear, Amber, Blue |
| BTL-018 | Vial 20ml | Vial | 20ml | Clear, Amber |

### Caps

| ID | Name | Type | Neck Size | Colors |
|----|------|------|-----------|--------|
| CAP-001 | Bamboo Dropper Cap 18mm | Dropper Cap | 18mm | Natural Bamboo, Black Bamboo |
| CAP-002 | Plastic Dropper Cap 20mm | Dropper Cap | 20mm | Clear, Amber, Black |
| CAP-003 | Metal Dropper Cap 22mm | Dropper Cap | 22mm | Gold, Silver, Rose Gold |
| CAP-004 | Pump Cap 28mm | Pump Cap | 28mm | White, Black, Silver |
| CAP-005 | Pump Cap 32mm | Pump Cap | 32mm | White, Matte Black, Gold |
| CAP-006 | Luxury Pump Cap 38mm | Pump Cap | 38mm | Chrome, Gold, Rose Gold |
| CAP-007 | Spray Cap 20mm | Spray Cap | 20mm | Clear, White, Black |
| CAP-008 | Spray Cap 24mm | Spray Cap | 24mm | White, Black, Transparent |
| CAP-009 | Matte Spray Cap 28mm | Spray Cap | 28mm | Matte Black, White, Silver |
| CAP-010 | Screw Cap 18mm | Screw Cap | 18mm | Silver, Gold, Black |
| CAP-011 | Screw Cap 20mm | Screw Cap | 20mm | White, Black, Clear |
| CAP-012 | Screw Cap 24mm | Screw Cap | 24mm | White, Black |
| CAP-013 | Flip Cap 20mm | Flip Cap | 20mm | White, Black, Clear |
| CAP-014 | Flip Cap 24mm | Flip Cap | 24mm | Natural, White, Black |
| CAP-015 | Flip Cap 28mm | Flip Cap | 28mm | White, Black, Transparent |
| CAP-016 | Magnetic Cap 30mm | Magnetic Cap | 30mm | Gold, Silver, Rose Gold |
| CAP-017 | Magnetic Cap 35mm | Magnetic Cap | 35mm | Brushed Gold, Black Chrome |
| CAP-018 | Luxury Magnetic Cap 40mm | Magnetic Cap | 40mm | 24K Gold, Platinum |

**Product badges:** `featured`, `bestSeller`, `newArrival` (boolean flags).

---

## Filtering & Search System

### State Management (`src/hooks/useCatalogFilters.ts`)

Filter state lives entirely in **URL query parameters** — no localStorage, no Redux.

```
/en/bottles?types=Dropper Bottle,Pump Bottle&weight=10-50&width=20-40&height=50-150&q=amber&sort=newest
```

On mount, the hook reads the URL and populates initial state. On filter change, it calls `router.push` with `scroll: false`. Debounce delays:
- Search query: 300ms
- Range inputs: 500ms

### Filter Logic (`src/lib/catalogUtils.ts`)

1. **Type filter** — exact match from `FilterState.types` array (empty = show all)
2. **Range filters** — `weight >= min && weight <= max`, same for width and height
3. **Search** — case-insensitive substring on `name + type + colors.join()`
4. **Sort — `name`**: A–Z by product name; **`newest`**: `newArrival=true` first, then A–Z

Key functions:
```typescript
filterProducts(products: Product[], filters: FilterState): Product[]
sortProducts(products: Product[], sortBy: FilterState['sortBy']): Product[]
getRangeExtents(products: Product[], dimension: 'weight'|'width'|'height'): [number, number]
getUniqueTypes(products: Product[]): string[]
```

---

## Styling System

### Tailwind Custom Config (`tailwind.config.ts`)

**Colors:**
```javascript
primary: {
  50: '#f0f7ff', 100: '#e0effe', 200: '#bae0fd', 300: '#7cc8fb',
  400: '#38acf7', 500: '#0e91eb', 600: '#0272ca', 700: '#035ba4',
  800: '#064d88', 900: '#0a347a', DEFAULT: '#0e91eb'
}
accent: { gold: '#D4AF37', copper: '#B87333' }
```

**Fonts:**
```javascript
fontFamily: {
  display: ['Playfair Display', 'serif'],
  body: ['Inter', 'sans-serif']
}
```

**Animations:** `fade-in` (0.5s), `slide-up` (0.6s), `float` (6s infinite), `marquee` (30s infinite)

### Custom Utility Classes (`src/app/globals.css`)

| Class | Usage |
|-------|-------|
| `.btn-primary` | Main CTA button (blue gradient) |
| `.btn-outline` | Secondary button (border style) |
| `.glass` | Frosted-glass card background |
| `.gradient-text` | Blue gradient text effect |
| `.container-custom` | Max-width + horizontal padding |
| `.section-padding` | Vertical section padding |

### Theme

Dark mode via `next-themes`. Strategy: `class` (adds `dark` to `<html>`). All components use `dark:` Tailwind variants. Stored in localStorage as key `olew-theme`.

### Utility

```typescript
import { cn } from '@/lib/utils'
// cn() = clsx + tailwind-merge
cn('base-class', condition && 'conditional-class', 'override-class')
```

---

## Key Components Reference

### Navigation (`src/components/layout/Navigation.tsx`)
- Sticky header, transparent → solid on scroll
- Logo (gradient background)
- Desktop nav: Home, About, Products, Bottles, Caps (+ active indicator)
- Mobile: hamburger → full-screen drawer
- Theme toggle (sun/moon)
- Language switcher (EN/ID dropdown, preserves current route)

### ProductCard (`src/components/catalog/ProductCard.tsx`)
- Shows: image (with fallback), badge (featured/bestSeller/newArrival), name, type, dimensions, color swatches
- Click → navigates to `/[lang]/[category]/[id]`
- Hover scale animation via Framer Motion

### ProductDetailView (`src/components/catalog/detail/ProductDetailView.tsx`)
- Full product detail layout
- Left: `ProductGallery` (image slider) + `Product3DViewer` (lazy-loaded)
- Right: specs table, `EnhancedColorPicker`, `OrderForm`, cap combination selector (for bottles), bulk info
- Bottom: `RelatedProducts` (same category/type)

### OrderForm (`src/components/catalog/detail/OrderForm.tsx`)
- Quantity input
- "Add to Inquiry" button (currently placeholder — no backend)
- Note: Action buttons were replaced with a Compare placeholder (see git: 421cdff)

### Product3DViewer (`src/components/catalog/detail/Product3DViewer.tsx`)
- Loaded via `next/dynamic` (no SSR)
- Loads GLB models from `/public/images/3d/base.glb` and `/public/images/3d/cap.glb`
- Controls: drag to rotate, scroll to zoom, reset camera button

### CountUp (`src/components/shared/CountUp.tsx`)
- Animates number from 0 to target when element enters viewport (Intersection Observer)
- Props: `end`, `duration`, `suffix`
- Easing: `easeOutQuart`

### FilterSidebar (`src/components/catalog/filters/FilterSidebar.tsx`)
- Desktop: left column sidebar, always visible
- Mobile: slide-in drawer (triggered by filter button in toolbar)
- Contains: TypeFilter (checkboxes) + RangeFilter × 3 (weight, width, height) + Clear All button

---

## Homepage Sections

| Section | Content |
|---------|---------|
| **HeroSection** | Embla carousel (3 slides), count-up stats (clients, products, certifications, experience) |
| **ShowcaseSection** | 4 featured collections with auto-rotate |
| **ProductsSection** | 5 industry tiles: Body Care, Skincare, Pharmacy, Pump Lotion, Perfume |
| **CertificatesSection** | Halal, ISO 9001:2015, GMP cert cards with animated rings |
| **ClientsSection** | Infinite marquee of 12 client logos + stats bar |
| **CTASection** | "Ready to start?" with WhatsApp + email contact cards |

---

## About Page

Company profile content:
- Founded: September 9, 2018
- Location: Jakarta, Indonesia
- Stats: 2018 (founded), 4+ industries, CPKB & SJH certifications, 100+ clients
- Mission: Provide high-quality packaging with exceptional service
- Vision: Lead Asian cosmetics packaging industry
- Industries: Food & Beverages, Cosmetics, Pharmaceutical, Beauty Products

---

## Performance Patterns

1. **Lazy loading** — `FilterSidebar` and `Product3DViewer` use `next/dynamic`
2. **Memoization** — filtered/sorted products use `useMemo`
3. **Debouncing** — search (300ms), range filters (500ms)
4. **Image fallback** — `next/image` with `onError` fallback to `broken-image.png`
5. **URL state** — filters in query params, no re-render on unrelated state changes

---

## SEO

- Root layout: meta title, description, viewport, manifest
- Catalog pages: JSON-LD structured data (`CollectionPage`, `BreadcrumbList` schemas)
- Product detail pages: dynamic title/description per product

---

## Docker / Deployment

```bash
# Development
npm run dev       # http://localhost:3000

# Production
npm run build
npm start

# Docker
docker-compose up -d   # Standalone Next.js image
```

`next.config.js` sets `output: 'standalone'` for Docker builds.

---

## Known State & Incomplete Areas

Based on git history and code review:

| Area | Status | Notes |
|------|--------|-------|
| Catalog filtering | Complete | URL-synced, all filters working |
| Product detail page | Mostly complete | 3D viewer, gallery, color picker in place |
| OrderForm | Placeholder | "Add to Inquiry" button has no backend action (commit 421cdff replaced action buttons with Compare placeholder) |
| Shopping cart | Not implemented | Redux installed but never wired up — `@reduxjs/toolkit` + `react-redux` unused |
| Inquiry/quote system | Not implemented | No form submission, no API route |
| Prices | Removed | Prices were stripped from all pages (commit 5067364) |
| 3D models | Depends on assets | GLB files need to exist at `/public/images/3d/` |
| Related products | Implemented | Same-category/type suggestions in detail page |
| `/products` page | Landing only | Shows category cards, not a full catalog |

---

## Git History Summary

| Commit | Change |
|--------|--------|
| `501ff12` | Initial Next.js e-commerce setup |
| `c8d7afd` | Rebranded from Welo Group → Olew Group, changed color scheme to blue |
| `5067364` | Removed all prices from all pages and features |
| `421cdff` | Replaced OrderForm action buttons with Compare placeholder |

---

## Development Rules (from CLAUDE.md)

1. All UI strings must come from `dict.*` via `useLang()` — never hardcode
2. Tailwind only — no CSS modules
3. Use `cn()` for conditional classes
4. Client components need `'use client'` at top
5. Icons from `lucide-react`, animations from `framer-motion`
6. 3D components loaded via `next/dynamic` (no SSR)
7. Do NOT introduce Redux — use React Context or URL state
8. Valid locales: `en`, `id` only

---

## Quick File Lookup

| What you need | Where to look |
|---------------|--------------|
| Add/edit a product | `src/data/products.ts` |
| Add/edit a UI string | `src/lib/dictionary.ts` (both `en` and `id`) |
| Change filter logic | `src/lib/catalogUtils.ts` |
| Change filter state/URL params | `src/hooks/useCatalogFilters.ts` |
| Change product types | `src/types/catalog.ts` |
| Add a new page | `src/app/[lang]/[new-page]/page.tsx` + `layout.tsx` |
| Global styles / custom classes | `src/app/globals.css` |
| Navbar or footer | `src/components/layout/` |
| Homepage sections | `src/components/sections/` |
| Product detail UI | `src/components/catalog/detail/` |
| Filter sidebar UI | `src/components/catalog/filters/` |
| Color palette / fonts | `tailwind.config.ts` |
