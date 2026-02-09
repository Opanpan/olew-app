'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

export default function ProductsLanding() {
  const { lang, dict } = useLang();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-custom mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {dict.catalog.products_landing.badge}
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {dict.catalog.products_landing.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            {dict.catalog.products_landing.subtitle}
          </p>
        </motion.div>

        {/* Product Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12"
        >
          {/* Bottles Card */}
          <motion.div variants={itemVariants}>
            <Link href={`/${lang}/bottles`}>
              <div className="group relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20 dark:opacity-10">
                  <img
                    src="/images/banners/bottles-banner.jpg"
                    alt="Bottles"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = '/images/banners/broken-image.png';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {dict.catalog.products_landing.bottles_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {dict.catalog.products_landing.bottles_description}
                    </p>
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-4 transition-all">
                      {dict.catalog.products_landing.bottles_cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </motion.div>

          {/* Caps Card */}
          <motion.div variants={itemVariants}>
            <Link href={`/${lang}/caps`}>
              <div className="group relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20 dark:opacity-10">
                  <img
                    src="/images/banners/caps-banner.jpg"
                    alt="Caps"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = '/images/banners/broken-image.png';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {dict.catalog.products_landing.caps_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {dict.catalog.products_landing.caps_description}
                    </p>
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-4 transition-all">
                      {dict.catalog.products_landing.caps_cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Confidence Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 border border-primary-200 dark:border-primary-800">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
                ✓
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
                ✓
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
                ✓
              </div>
            </div>
            <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
              {dict.catalog.products_landing.confidence_text}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
