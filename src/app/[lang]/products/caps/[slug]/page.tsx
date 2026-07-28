import { permanentRedirect } from 'next/navigation';

interface LegacyCapDetailPageProps {
  params: { lang: string; slug: string };
}

// /caps/[slug] has never been linked to anywhere in the app — every product
// card and internal link points at /products/[slug], which handles slug vs.
// legacy-UUID resolution itself. This route only exists to catch old bookmarks.
export default function LegacyCapDetailPage({ params }: LegacyCapDetailPageProps) {
  permanentRedirect(`/${params.lang}/products/${params.slug}`);
}
