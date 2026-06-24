'use client';

import { motion } from 'framer-motion';
import { ProductListItem } from '@/lib/publicApi';
import ApiProductCard from './ApiProductCard';

interface ApiProductGridProps {
  products: ProductListItem[];
  lang: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function ApiProductGrid({ products, lang }: ApiProductGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-6"
    >
      {products.map((product, index) => (
        <ApiProductCard key={product.id} product={product} lang={lang} index={index} />
      ))}
    </motion.div>
  );
}
