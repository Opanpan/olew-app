# Frontend Prompt: SEO Product Slugs + Sitemap

Use this document as an implementation brief for the OLEW frontend after the backend SEO changes.

API base: `{API_BASE}/api/v1/public`

---

## Context

Backend product APIs now resolve by **slug** (`slug_en` or `slug_id`) or **UUID** (fallback for migration). Public product URLs must use slugs for SEO. UUID in the path still works, but the frontend must prefer slug.

Sitemap is **not** served as final XML by the API. Frontend generates `/sitemap.xml` on the **public site domain** using a JSON feed from the backend.

---

## Goals

1. Product detail and related flows use slug in routes and API calls
2. All product links (list / popular / latest / related / cards) point to slug URLs
3. Generate `sitemap.xml` on the frontend origin (not the API host)
4. Support bilingual EN/ID via `slug_en` / `slug_id`
5. Optional: 301 redirect old UUID product URLs to the correct slug URL

---

## 1. Routing

Replace UUID-based product routes with slug:

| Before | After |
|--------|--------|
| `/products/[id]` (UUID) | `/products/[slug]` |
| or locale + UUID | `/{locale}/products/[slug]` |

Locale mapping:

- `en` → use `slug_en`
- `id` → use `slug_id`

All navigation (cards, search, related, configurator) must use the slug for the active locale.

---

## 2. API calls — path param `slugOrId`

Endpoints that previously used `:id` now accept **slug_en OR slug_id OR UUID**:

| Method | Path |
|--------|------|
| `GET` | `/products/{slugOrId}` |
| `GET` | `/products/{slugOrId}/related` |
| `GET` | `/products/{slugOrId}/compatibilities` |
| `GET` | `/products/{slugOrId}/engagement` |
| `POST` | `/products/{slugOrId}/like` |
| `DELETE` | `/products/{slugOrId}/like` |
| `POST` | `/products/{slugOrId}/share` |

### Frontend rules

- On the detail page, read `params.slug` from the URL
- Pass that slug straight into the APIs above (do not require a UUID round-trip first)
- Detail response includes `slug_en` and `slug_id` — use them for canonical, hreflang, and locale switching

### Detail payload (important fields)

```ts
{
  id: string
  name_en: string
  name_id: string
  slug_en: string
  slug_id: string
  // images, attributes, like_count, share_count, ...
}
```

### List / related / popular / latest item

```ts
{
  id: string
  name_en: string
  name_id: string
  slug_en: string
  slug_id: string
  thumbnail: string
  min_price: number
  // ...
}
```

Compatible products also include `slug_en` / `slug_id`.

### Suggested helper

```ts
function productPath(
  locale: 'en' | 'id',
  p: { slug_en: string; slug_id: string },
) {
  const slug = locale === 'id' ? p.slug_id : p.slug_en
  return `/${locale}/products/${slug}`
  // or `/products/${slug}` if the app has no locale prefix
}
```

---

## 3. Like / Share / Engagement

Headers / body unchanged:

- Like / Unlike: require header `X-Visitor-Id: <uuid-v4>` (store in `localStorage`)
- Share body (optional):

```json
{ "platform": "whatsapp" }
```

Allowed platforms: `whatsapp`, `facebook`, `twitter`, `telegram`, `copy`, `other`

Use the **slug from the page URL** as `{slugOrId}` for these calls (not only `product.id`, unless falling back).

---

## 4. Filters (optional improvement)

`GET /products/filters` now returns `code` on types and categories:

```ts
{ id: string, code: string, name_en: string, name_id: string }
```

List filter query params can still use UUIDs (`type_id` / `category_id`) for now. You may display `code` in the UI; do not break existing filter queries unless you also implement code→id mapping.

---

## 5. Sitemap.xml on the frontend (required)

### Backend JSON feed

`GET /api/v1/public/seo/sitemap`

`data` shape:

```ts
{
  generated_at: string // ISO
  products: Array<{
    id: string
    slug_en: string
    slug_id: string
    updated_at: string // ISO
  }>
  static_pages: Array<{
    path: string // e.g. "/about", "/contact", "/faq"
    updated_at: string | null
  }>
}
```

### Frontend must

1. Implement `app/sitemap.ts` (Next.js App Router) or equivalent that fetches the JSON feed
2. Serve `/sitemap.xml` on **`SITE_URL`** (e.g. `https://www.olew.com/sitemap.xml`)
3. Use **absolute** public URLs only, for example:
   - `https://www.olew.com/en/products/{slug_en}`
   - `https://www.olew.com/id/products/{slug_id}`
4. If bilingual, add language alternates / `hreflang` (`en`, `id`, `x-default`)
5. Set `lastModified` from `updated_at`
6. Include `static_pages` prefixed with `SITE_URL`
7. Submit the **frontend** sitemap URL in Google Search Console (not the API host)

Do **not** use the API domain as sitemap `loc` values.

### Next.js sketch

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${API_BASE}/api/v1/public/seo/sitemap`, {
    next: { revalidate: 3600 },
  })
  const json = await res.json()
  const data = json.data

  const staticEntries: MetadataRoute.Sitemap = data.static_pages.map(
    (p: { path: string; updated_at: string | null }) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    }),
  )

  const productEntries: MetadataRoute.Sitemap = data.products.flatMap(
    (p: { slug_en: string; slug_id: string; updated_at: string }) => [
      {
        url: `${SITE_URL}/en/products/${p.slug_en}`,
        lastModified: new Date(p.updated_at),
        alternates: {
          languages: {
            en: `${SITE_URL}/en/products/${p.slug_en}`,
            id: `${SITE_URL}/id/products/${p.slug_id}`,
          },
        },
      },
      {
        url: `${SITE_URL}/id/products/${p.slug_id}`,
        lastModified: new Date(p.updated_at),
        alternates: {
          languages: {
            en: `${SITE_URL}/en/products/${p.slug_en}`,
            id: `${SITE_URL}/id/products/${p.slug_id}`,
          },
        },
      },
    ],
  )

  return [...staticEntries, ...productEntries]
}
```

Adjust path prefixes if the app does not use `/{locale}/...`.

---

## 6. SEO metadata on product detail

On `/products/[slug]` (or `/{locale}/products/[slug]`):

- `title` / `description` from name + short description for the active locale
- `canonical` → slug URL for the active locale
- `alternates.languages`:
  - `en` → URL with `slug_en`
  - `id` → URL with `slug_id`
- Open Graph URL = canonical
- Optional: if the opened slug belongs to the other locale, redirect to the correct locale slug

Use `generateMetadata` (Next.js) when applicable.

---

## 7. Legacy UUID URL migration (recommended)

If old deep links exist as `/products/{uuid}`:

1. Detect UUID in the route param
2. Call `GET /products/{uuid}` (still supported)
3. **301** redirect to `/products/{slug_en|slug_id}` for the active locale

---

## 8. Acceptance criteria

- [ ] Public product URLs do not expose UUID (except temporary redirect)
- [ ] Detail, related, compat, like, share, engagement are called with the route slug
- [ ] Product cards link to the locale slug
- [ ] `/sitemap.xml` is reachable on the FE domain and includes products + static pages
- [ ] EN/ID `hreflang` (or equivalent) is correct if the site is bilingual
- [ ] API path param treated as `slugOrId`
- [ ] `X-Visitor-Id` still used for like / unlike

---

## Out of scope

- Admin CMS (may keep UUID)
- Generating final XML on the backend
- Switching list filter query params from UUID to `code` (unless FE also implements mapping)

---

## Quick reference — related backend docs

- Swagger UI: `/swagger/index.html`
- Public API overview: [PUBLIC_API_DOCUMENTATION.md](./PUBLIC_API_DOCUMENTATION.md)
- README public endpoints table (slug + sitemap notes)
