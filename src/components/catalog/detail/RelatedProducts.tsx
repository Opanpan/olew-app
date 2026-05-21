'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types/catalog';
import ProductCard from '../ProductCard';
import { useLang } from '@/lib/LangContext';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  maxItems?: number;
}

export default function RelatedProducts({
  currentProduct,
  allProducts,
  maxItems = 4,
}: RelatedProductsProps) {
  const { lang, dict } = useLang();
  const d = dict.catalog.product_detail;

  // Find related products based on type similarity
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        // Exclude current product
        if (product.id === currentProduct.id) return false;

        // Prioritize same type
        if (product.type === currentProduct.type) return true;

        // Then same category
        if (product.category === currentProduct.category) return true;

        return false;
      })
      .slice(0, maxItems);
  }, [currentProduct, allProducts, maxItems]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container-custom mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {d.related_products}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400"
            >
              {d.related_desc}
            </motion.p>
          </div>

          <Link
            href={`/${lang}/${currentProduct.category === 'bottle' ? 'bottles' : 'caps'}`}
            className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:gap-3 transition-all font-medium group"
          >
            {d.view_all}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <Link
          href={`/${lang}/${currentProduct.category === 'bottle' ? 'bottles' : 'caps'}`}
          className="md:hidden mt-8 btn-outline w-full flex items-center justify-center gap-2 py-4 min-h-[48px]"
        >
          {d.view_all_products}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
