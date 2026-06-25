'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Check, Heart, Share2, Link2 } from 'lucide-react';
import { ProductListItem } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem } from '@/lib/CompareContext';
import { useLike, useShare } from '@/hooks/useProductActions';
import { cn } from '@/lib/utils';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';

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

  const { liked, toggle: toggleLike } = useLike(product.id);
  const { share, copied } = useShare(name);
  const c = dict.catalog.product_card;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.thumbnail,
    };
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
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative"
    >
      {/* ── Glassmorphism card ── */}
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border border-white/80 dark:border-gray-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:shadow-[0_8px_40px_rgba(43,135,245,0.15)] dark:group-hover:shadow-[0_8px_40px_rgba(43,135,245,0.12)] group-hover:border-primary-200/60 dark:group-hover:border-primary-700/40 group-hover:-translate-y-1">

        {/* ── Image ── */}
        <Link href={detailUrl} className="block relative aspect-[3/4] overflow-hidden">
          {/* Background gradient behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900" />

          <ImgWithFallback
            src={product.thumbnail}
            alt={name}
            fallback={PRODUCT_PLACEHOLDER}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Subtle bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Like button */}
          <motion.button
            onClick={(e) => { e.preventDefault(); toggleLike(); }}
            whileTap={{ scale: 0.8 }}
            aria-label={liked ? c.liked : c.like}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200',
              liked
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 text-gray-400 hover:text-red-500 hover:bg-white/90'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5 transition-all', liked && 'fill-white')} />
          </motion.button>

          {/* Copied toast */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gray-900/70 text-white text-[10px] font-medium backdrop-blur-sm border border-white/10"
              >
                {c.share_copied}
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Details — slide up on hover */}
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
            <span className="block w-full py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl text-center text-xs font-semibold text-gray-900 dark:text-white border border-white/60 dark:border-gray-700/60 shadow-lg">
              {c.view_details} →
            </span>
          </div>
        </Link>

        {/* ── Info ── */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {name}
          </h3>

          {/* Attribute pills */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(product.attributes).slice(0, 3).map(([key, attr]) => (
                <span
                  key={key}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 dark:text-gray-400 font-medium border border-gray-200/50 dark:border-gray-700/50"
                >
                  {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                </span>
              ))}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-1.5">
            <AnimatePresence mode="wait">
              {showMaxMsg ? (
                <motion.p
                  key="max"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center"
                >
                  {dict.catalog.compare.max_reached}
                </motion.p>
              ) : (
                <motion.button
                  key="compare"
                  onClick={handleCompareToggle}
                  disabled={!isComparing && !canAdd}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200',
                    isComparing
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/25'
                      : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/70 dark:border-gray-700/70 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  )}
                >
                  {isComparing
                    ? <><Check className="w-3 h-3" />{dict.catalog.compare.added}</>
                    : <><ArrowLeftRight className="w-3 h-3" />{dict.catalog.compare.toggle}</>
                  }
                </motion.button>
              )}
            </AnimatePresence>

            {/* Share */}
            <motion.button
              onClick={share}
              whileTap={{ scale: 0.88 }}
              aria-label={c.share}
              className={cn(
                'w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 backdrop-blur-sm',
                copied
                  ? 'border-primary-400 text-primary-500 bg-primary-50/80 dark:bg-primary-900/30'
                  : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/70 dark:border-gray-700/70 text-gray-400 hover:border-primary-400 hover:text-primary-500'
              )}
            >
              {copied ? <Link2 className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
