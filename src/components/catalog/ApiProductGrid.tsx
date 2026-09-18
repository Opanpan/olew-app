'use client';

import { ProductListItem } from '@/lib/publicApi';
import ApiProductCard from './ApiProductCard';

interface ApiProductGridProps {
  products: ProductListItem[];
  lang: string;
}

export default function ApiProductGrid({ products, lang }: ApiProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ApiProductCard key={product.id} product={product} lang={lang} />
      ))}
    </div>
  );
}
