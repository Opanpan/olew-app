import { notFound } from 'next/navigation';
import { getProductDetail, getRelatedProducts, getProductCompatibilities } from '@/lib/publicApi';
import ApiProductDetailView from '@/components/catalog/detail/ApiProductDetailView';

interface CapDetailPageProps {
  params: { lang: string; id: string };
}

export default async function CapDetailPage({ params }: CapDetailPageProps) {
  const [product, related, compatibility] = await Promise.all([
    getProductDetail(params.id),
    getRelatedProducts(params.id),
    getProductCompatibilities(params.id),
  ]);

  if (!product) notFound();

  return <ApiProductDetailView product={product} relatedProducts={related} compatibility={compatibility} />;
}
