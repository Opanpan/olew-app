'use client';

import { motion } from 'framer-motion';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface CatalogHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function CatalogHeader({
  badge,
  title,
  subtitle,
  breadcrumbs,
}: CatalogHeaderProps) {
  return (
    <header className="relative bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/20 pt-24 md:pt-28 lg:pt-32 pb-10 md:pb-14 lg:pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="container-custom mx-auto relative z-10 px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-6"
          aria-label="Breadcrumb"
        >
          <Breadcrumb items={breadcrumbs} />
        </motion.nav>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-300 font-semibold text-xs md:text-sm mb-4 md:mb-6"
        >
          {badge}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>
    </header>
  );
}
