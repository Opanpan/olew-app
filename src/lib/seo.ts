import type { Metadata } from 'next';
import type { ProductDetail } from './publicApi';

// Public site origin — distinct from NEXT_PUBLIC_API_BASE_URL (the API host).
// Sitemap/canonical/hreflang URLs must point at this domain, never the API.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://olew-app.kinderheim511.com').replace(/\/$/, '');

export type Lang = 'en' | 'id';

/** Locale-correct slug for a product (falls back to the other locale's slug, then id, so a link never 404s on missing data). */
export function productSlug(lang: string, product: { id: string; slug_en?: string; slug_id?: string }): string {
  const primary = lang === 'id' ? product.slug_id : product.slug_en;
  return primary || product.slug_en || product.slug_id || product.id;
}

/** Site-relative path to a product's detail page for the given locale. */
export function productPath(lang: string, product: { id: string; slug_en?: string; slug_id?: string }): string {
  return `/${lang}/products/${productSlug(lang, product)}`;
}

/** Absolute, canonical URL to a product's detail page for the given locale. */
export function absoluteProductUrl(lang: string, product: { id: string; slug_en?: string; slug_id?: string }): string {
  return `${SITE_URL}${productPath(lang, product)}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildProductMetadata(lang: string, product: ProductDetail): Metadata {
  const isId = lang === 'id';
  const name = isId ? product.name_id : product.name_en;
  const shortDesc = isId ? product.description?.short_id : product.description?.short_en;
  const description = shortDesc || (isId
    ? `${name} — kemasan premium dari Olew Group.`
    : `${name} — premium packaging from Olew Group.`);

  const canonicalUrl = absoluteProductUrl(lang, product);
  const enUrl = `${SITE_URL}/en/products/${productSlug('en', product)}`;
  const idUrl = `${SITE_URL}/id/products/${productSlug('id', product)}`;
  const image = product.images?.find((img) => img.is_thumbnail) ?? product.images?.[0];

  return {
    title: `${name} | Olew Group`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: enUrl,
        id: idUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      title: name,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: isId ? 'id_ID' : 'en_US',
      siteName: 'Olew Group',
      images: image ? [{ url: image.file_path }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
