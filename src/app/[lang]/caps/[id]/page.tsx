import { notFound } from 'next/navigation';
import { capsData } from '@/data/products';
import ProductDetailView from '@/components/catalog/detail/ProductDetailView';

interface CapDetailPageProps {
  params: {
    lang: string;
    id: string;
  };
}

export async function generateStaticParams() {
  const langs = ['en', 'id'];
  const params = [];

  for (const lang of langs) {
    for (const cap of capsData) {
      params.push({
        lang,
        id: cap.id,
      });
    }
  }

  return params;
}

export default function CapDetailPage({ params }: CapDetailPageProps) {
  const product = capsData.find((c) => c.id === params.id);

  if (!product) {
    notFound();
  }

  // Generate placeholder images based on product ID
  const images = [
    `/api/placeholder/800/800?text=${encodeURIComponent(product.name)}`,
    `/api/placeholder/800/800?text=${encodeURIComponent(product.name)}-2`,
    `/api/placeholder/800/800?text=${encodeURIComponent(product.name)}-3`,
  ];

  return (
    <ProductDetailView
      product={product}
      allProducts={capsData}
      images={images}
    />
  );
}
