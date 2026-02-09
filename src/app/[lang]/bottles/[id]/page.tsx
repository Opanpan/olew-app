import { notFound } from 'next/navigation';
import { bottlesData, capsData } from '@/data/products';
import ProductDetailView from '@/components/catalog/detail/ProductDetailView';

interface BottleDetailPageProps {
  params: {
    lang: string;
    id: string;
  };
}

export async function generateStaticParams() {
  const langs = ['en', 'id'];
  const params = [];

  for (const lang of langs) {
    for (const bottle of bottlesData) {
      params.push({
        lang,
        id: bottle.id,
      });
    }
  }

  return params;
}

export default function BottleDetailPage({ params }: BottleDetailPageProps) {
  const product = bottlesData.find((b) => b.id === params.id);

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
      allProducts={[...bottlesData, ...capsData]}
      images={images}
    />
  );
}
