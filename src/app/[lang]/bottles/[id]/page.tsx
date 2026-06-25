'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getProductDetail, getRelatedProducts, getProductCompatibilities, type ProductDetail, type ProductListItem, type ProductCompatibility } from '@/lib/publicApi';
import ApiProductDetailView from '@/components/catalog/detail/ApiProductDetailView';

export default function BottleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [compatibility, setCompatibility] = useState<ProductCompatibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    Promise.all([
      getProductDetail(id),
      getRelatedProducts(id),
      getProductCompatibilities(id),
    ]).then(([p, r, c]) => {
      if (!p) { setNotFoundState(true); return; }
      setProduct(p);
      setRelated(r);
      setCompatibility(c);
      setLoading(false);
    });
  }, [id]);

  if (notFoundState) { notFound(); }
  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ApiProductDetailView product={product} relatedProducts={related} compatibility={compatibility} />;
}
