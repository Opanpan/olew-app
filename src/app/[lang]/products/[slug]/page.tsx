import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProductDetail, getRelatedProducts, getProductCompatibilities } from '@/lib/publicApi';
import { productSlug, buildProductMetadata } from '@/lib/seo';
import ApiProductDetailView from '@/components/catalog/detail/ApiProductDetailView';

interface ProductDetailPageProps {
  params: { lang: string; slug: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { lang, slug } = params;
  const product = await getProductDetail(slug);
  if (!product) return {};
  return buildProductMetadata(lang, product);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { lang, slug } = params;

  // The API resolves this path param as slug_en, slug_id, or a legacy UUID — all
  // in one lookup, no separate "is this a UUID" round-trip needed.
  const product = await getProductDetail(slug);
  if (!product) notFound();

  // Canonicalize: a legacy UUID deep link, or a request for the other locale's
  // slug, both redirect to this locale's real slug so the URL bar always shows
  // the SEO-correct address.
  const canonicalSlug = productSlug(lang, product);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${lang}/products/${canonicalSlug}`);
  }

  const [related, compatibility] = await Promise.all([
    getRelatedProducts(slug),
    getProductCompatibilities(slug),
  ]);

  return (
    <ApiProductDetailView
      product={product}
      relatedProducts={related}
      compatibility={compatibility}
      slug={slug}
    />
  );
}
