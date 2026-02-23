'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Droplet, Package, Award, Sparkles } from 'lucide-react';
import { Product } from '@/types/catalog';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { lang, dict } = useLang();

  // Choose icon based on product category
  const Icon = product.category === 'bottle' ? Droplet : Package;
  const detailUrl = `/${lang}/${product.category === 'bottle' ? 'bottles' : 'caps'}/${product.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/banners/broken-image.png';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-300 dark:text-gray-700 group-hover:text-primary-400 transition-colors duration-500" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-1.5 md:gap-2">
          {product.featured && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-accent-gold text-white text-[10px] md:text-xs font-semibold shadow-lg backdrop-blur-sm"
            >
              <Award className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />
              Featured
            </motion.div>
          )}
          {product.bestSeller && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-primary-500 text-white text-[10px] md:text-xs font-semibold shadow-lg"
            >
              Best Seller
            </motion.div>
          )}
          {product.newArrival && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] md:text-xs font-semibold shadow-lg"
            >
              <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />
              New
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 lg:p-6 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="font-display text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        {/* Product Type */}
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4 line-clamp-1">
          {product.type}
        </p>

        {/* Dimensions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 mb-3 md:mb-4 text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-semibold">{product.dimensions.weight}g</span>
          </div>
          <div className="w-px h-3 md:h-4 bg-gray-300 dark:bg-gray-700" />
          <div>
            <span className="font-semibold">{product.dimensions.width}×{product.dimensions.height}mm</span>
          </div>
          {product.dimensions.capacity && (
            <>
              <div className="w-px h-3 md:h-4 bg-gray-300 dark:bg-gray-700" />
              <div>
                <span className="font-semibold">{product.dimensions.capacity}ml</span>
              </div>
            </>
          )}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Colors:</span>
          <div className="flex gap-1 md:gap-1.5">
            {product.colors.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
                title={color}
                aria-label={color}
              />
            ))}
            {product.colors.length > 3 && (
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[7px] md:text-[8px] text-gray-600 dark:text-gray-400 font-semibold">
                +{product.colors.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* View Details Button - Pushed to bottom */}
        <Link
          href={detailUrl}
          className="btn-primary w-full text-xs md:text-sm px-4 md:px-6 py-3 md:py-3.5 min-h-[44px] mt-auto flex items-center justify-center"
          aria-label={`View details for ${product.name}`}
        >
          {dict.catalog.product_card.view_details}
        </Link>
      </div>
    </motion.article>
  );
}
