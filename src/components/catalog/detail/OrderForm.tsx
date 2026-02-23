'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

export default function OrderForm() {
  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-outline w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-5 text-xs md:text-base font-semibold min-h-[44px] md:min-h-[52px]"
      >
        <ArrowLeftRight className="w-4 h-4 md:w-6 md:h-6" />
        Compare
      </motion.button>
    </div>
  );
}
