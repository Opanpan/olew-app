import type { MetadataRoute } from 'next';
import { getSitemapFeed } from '@/lib/publicApi';
import { SITE_URL, productSlug } from '@/lib/seo';

const LOCALES = ['en', 'id'] as const;

// Baseline routes this frontend always serves, independent of the backend's
// static_pages feed (which may be empty/partial) — keeps the sitemap useful
// even before that CMS content is populated.
const CORE_PATHS = ['', '/about', '/products', '/bottles', '/caps', '/pot'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feed = await getSitemapFeed();

  const coreEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    CORE_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          id: `${SITE_URL}/id${path}`,
        },
      },
    }))
  );

  const feedStaticEntries: MetadataRoute.Sitemap = (feed?.static_pages ?? []).flatMap((p) => {
    const path = p.path === '/' ? '' : p.path;
    const lastModified = p.updated_at ? new Date(p.updated_at) : undefined;
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          id: `${SITE_URL}/id${path}`,
        },
      },
    }));
  });

  const productEntries: MetadataRoute.Sitemap = (feed?.products ?? []).flatMap((p) => {
    const enUrl = `${SITE_URL}/en/products/${productSlug('en', p)}`;
    const idUrl = `${SITE_URL}/id/products/${productSlug('id', p)}`;
    const lastModified = new Date(p.updated_at);
    const alternates = { languages: { en: enUrl, id: idUrl, 'x-default': enUrl } };
    return [
      { url: enUrl, lastModified, alternates },
      { url: idUrl, lastModified, alternates },
    ];
  });

  // The backend feed may already cover some/all of CORE_PATHS (e.g. "/", "/about")
  // — prefer its entry (it carries a real lastModified) and only fall back to the
  // baseline for whatever it doesn't include.
  const seen = new Set(feedStaticEntries.map((e) => e.url));
  const dedupedCore = coreEntries.filter((e) => !seen.has(e.url));

  return [...feedStaticEntries, ...dedupedCore, ...productEntries];
}
