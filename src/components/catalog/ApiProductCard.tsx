'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Check } from 'lucide-react';
import { ProductListItem } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem } from '@/lib/CompareContext';
import { cn } from '@/lib/utils';
import ImgWithFallback from '@/components/shared/ImgWithFallback';

interface ApiProductCardProps {
  product: ProductListItem;
  lang: string;
  index?: number;
}

export default function ApiProductCard({ product, lang, index = 0 }: ApiProductCardProps) {
  const { dict } = useLang();
  const { toggle, has, canAdd } = useCompare();
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const name = lang === 'id' ? product.name_id : product.name_en;
  const detailUrl = `/${lang}/products/${product.id}`;
  const isComparing = has(product.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const item: CompareItem = { id: product.id, name_en: product.name_en, name_id: product.name_id, thumbnail: product.thumbnail };
    const ok = toggle(item);
    if (!ok) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2000);
    }
  };

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
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <ImgWithFallback
          src={product.thumbnail}
          alt={name}
          className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 lg:p-6 flex flex-col flex-1">
        <h3 className="font-display text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name}
        </h3>

        {/* Action buttons */}
        <div className="mt-auto space-y-2">
          {/* Compare toggle */}
          <AnimatePresence mode="wait">
            {showMaxMsg ? (
              <motion.div
                key="max"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full py-2.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center text-xs font-medium text-amber-700 dark:text-amber-300"
              >
                {dict.catalog.compare.max_reached}
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                onClick={handleCompareToggle}
                whileTap={{ scale: 0.97 }}
                disabled={!isComparing && !canAdd}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 border-2',
                  isComparing
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/25'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                )}
              >
                {isComparing ? <Check className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                {isComparing ? dict.catalog.compare.added : dict.catalog.compare.toggle}
              </motion.button>
            )}
          </AnimatePresence>

          <Link
            href={detailUrl}
            className="btn-primary w-full text-xs md:text-sm px-4 md:px-6 py-3 md:py-3.5 min-h-[44px] flex items-center justify-center"
          >
            {dict.catalog.product_card.view_details}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
