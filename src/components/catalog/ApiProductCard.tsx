'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { ProductListItem } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';

interface ApiProductCardProps {
  product: ProductListItem;
  lang: string;
  index?: number;
}

export default function ApiProductCard({ product, lang, index = 0 }: ApiProductCardProps) {
  const { dict } = useLang();
  const name = lang === 'id' ? product.name_id : product.name_en;
  const detailUrl = `/${lang}/products/${product.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        'group relative rounded-2xl md:rounded-3xl overflow-hidden',
        'bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800',
        'shadow-lg hover:shadow-2xl',
        'transition-all duration-500',
        'flex flex-col h-full'
      )}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/banners/broken-image.png';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-300 dark:text-gray-700 group-hover:text-primary-400 transition-colors duration-500" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 lg:p-6 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="font-display text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name}
        </h3>

        {/* Min Price */}
        {product.min_price > 0 && (
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 md:mb-4">
            From Rp {product.min_price.toLocaleString('id-ID')}
          </p>
        )}

        {/* Action buttons - pushed to bottom */}
        <div className="mt-auto">
          <Link
            href={detailUrl}
            className="btn-primary w-full text-xs md:text-sm px-4 md:px-6 py-3 md:py-3.5 min-h-[44px] flex items-center justify-center"
            aria-label={`View details for ${name}`}
          >
            {dict.catalog.product_card.view_details}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
