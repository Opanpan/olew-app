import { notFound } from 'next/navigation';
import { getProductDetail, getRelatedProducts } from '@/lib/publicApi';
import ApiProductDetailView from '@/components/catalog/detail/ApiProductDetailView';

interface CapDetailPageProps {
  params: {
    lang: string;
    id: string;
  };
}

export default async function CapDetailPage({ params }: CapDetailPageProps) {
  const [product, related] = await Promise.all([
    getProductDetail(params.id),
    getRelatedProducts(params.id),
  ]);

  if (!product) {
    notFound();
  }

  return <ApiProductDetailView product={product} relatedProducts={related} />;
}
