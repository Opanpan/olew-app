import { permanentRedirect } from 'next/navigation';

interface LegacyBottleDetailPageProps {
  params: { lang: string; slug: string };
}

// /bottles/[slug] has never been linked to anywhere in the app — every product
// card and internal link points at /products/[slug], which handles slug vs.
// legacy-UUID resolution itself. This route only exists to catch old bookmarks.
export default function LegacyBottleDetailPage({ params }: LegacyBottleDetailPageProps) {
  permanentRedirect(`/${params.lang}/products/${params.slug}`);
}
