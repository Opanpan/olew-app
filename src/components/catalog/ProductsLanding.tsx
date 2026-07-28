'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLang } from '@/lib/LangContext';
import { getProductFiltersData, type ProductFiltersData, type ProductCategoryBasic } from '@/lib/publicApi';
import { familyOfCategory, familyToSlug, type ProductFamily } from '@/lib/productTaxonomy';

// ── Category icon mapping ─────────────────────────────────────────────────────
// Maps category name keywords → a colored SVG illustration + gradient

interface CategoryIcon {
  bg: string;
  svg: React.ReactNode;
}

function BottleIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 80" className="w-10 h-12" fill="none">
      <rect x="24" y="2" width="16" height="10" rx="3" fill={color} opacity="0.9" />
      <path d="M24 12 Q18 20 16 28 L16 68 Q16 76 32 76 Q48 76 48 68 L48 28 Q46 20 40 12 Z" fill={color} opacity="0.85" />
      <rect x="22" y="36" width="20" height="24" rx="2" fill="white" opacity="0.25" />
    </svg>
  );
}

function CapIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 48" className="w-10 h-8" fill="none">
      <ellipse cx="32" cy="40" rx="28" ry="7" fill={color} opacity="0.3" />
      <path d="M8 36 Q8 8 32 8 Q56 8 56 36 Z" fill={color} opacity="0.85" />
      <rect x="10" y="36" width="44" height="8" rx="4" fill={color} />
      <ellipse cx="32" cy="10" rx="18" ry="5" fill={color} opacity="0.6" />
    </svg>
  );
}

function PotIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 56" className="w-10 h-9" fill="none">
      <ellipse cx="32" cy="10" rx="20" ry="6" fill={color} opacity="0.9" />
      <path d="M12 10 L15 44 Q16 52 32 52 Q48 52 49 44 L52 10" fill={color} opacity="0.85" />
      <ellipse cx="32" cy="10" rx="20" ry="6" fill="white" opacity="0.2" />
      <rect x="20" y="22" width="24" height="16" rx="2" fill="white" opacity="0.2" />
    </svg>
  );
}

const BOTTLE_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#0ea5e9'
];
const CAP_COLORS = [
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#3b82f6','#10b981'
];
const POT_COLORS = [
  '#f59e0b','#14b8a6','#8b5cf6','#ec4899','#3b82f6','#10b981','#f97316'
];

function getCategoryIcon(family: ProductFamily, index: number): CategoryIcon {
  if (family === 'bottle') {
    const color = BOTTLE_COLORS[index % BOTTLE_COLORS.length];
    return {
      bg: `${color}15`,
      svg: <BottleIcon color={color} />,
    };
  }
  if (family === 'pot') {
    const color = POT_COLORS[index % POT_COLORS.length];
    return {
      bg: `${color}15`,
      svg: <PotIcon color={color} />,
    };
  }
  const color = CAP_COLORS[index % CAP_COLORS.length];
  return {
    bg: `${color}15`,
    svg: <CapIcon color={color} />,
  };
}

// ── Category circle ───────────────────────────────────────────────────────────

function CategoryCircle({
  category,
  typeSlug,
  icon,
  lang,
  index,
}: {
  category: ProductCategoryBasic;
  typeSlug: 'bottles' | 'caps' | 'pot';
  icon: CategoryIcon;
  lang: string;
  index: number;
}) {
  const name = lang === 'id' ? category.name_id : category.name_en;
  const href = `/${lang}/products?cat=${typeSlug}&s_cat=${category.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.4 }}
      className="flex flex-col items-center gap-2.5 group cursor-pointer"
    >
      <Link href={href} className="flex flex-col items-center gap-2.5">
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ backgroundColor: icon.bg }}
        >
          {icon.svg}
        </div>
        <span className="text-xs md:text-sm font-semibold text-primary-600 dark:text-primary-400 text-center leading-tight max-w-[80px] group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
          {name}
        </span>
      </Link>
    </motion.div>
  );
}

// ── Type section ──────────────────────────────────────────────────────────────

function TypeSection({
  family,
  familyLabel,
  categories,
  lang,
  sectionIndex,
}: {
  family: ProductFamily;
  familyLabel: string;
  categories: ProductCategoryBasic[];
  lang: string;
  sectionIndex: number;
}) {
  const typeSlug = familyToSlug(family);
  const typeLabel = familyLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sectionIndex * 0.2, duration: 0.5 }}
      className="mb-10"
    >
      {/* Section heading */}
      <h2 className="text-xl md:text-2xl font-bold text-primary-700 dark:text-primary-400 mb-6">
        Catalog {typeLabel}
      </h2>

      {/* Category circles */}
      <div className="flex flex-wrap gap-6 md:gap-8">
        {categories.map((cat, i) => {
          const icon = getCategoryIcon(family, i);
          return (
            <CategoryCircle
              key={cat.id}
              category={cat}
              typeSlug={typeSlug}
              icon={icon}
              lang={lang}
              index={i}
            />
          );
        })}

        {/* "All" shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + categories.length * 0.06, duration: 0.4 }}
          className="flex flex-col items-center gap-2.5 group cursor-pointer"
        >
          <Link href={`/${lang}/products/${typeSlug}`} className="flex flex-col items-center gap-2.5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-primary-400 dark:group-hover:border-primary-500 group-hover:scale-110 transition-all duration-300 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors">
                ···
              </span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {lang === 'id' ? 'Semua' : 'All'}
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductsLanding() {
  const { lang, dict } = useLang();
  const d = dict.catalog.products_landing;
  const [filterData, setFilterData] = useState<ProductFiltersData | null>(null);

  useEffect(() => {
    getProductFiltersData().then(setFilterData);
  }, []);

  // Group categories into the 3 catalog families — Bottle, Cap, Pot (Inner/Outer
  // Pot collapse into "Pot" so they share one section instead of being dropped).
  const FAMILY_ORDER: ProductFamily[] = ['bottle', 'cap', 'pot'];
  const familyLabels: Record<ProductFamily, string> = {
    bottle: dict.nav.bottles,
    cap: dict.nav.caps,
    pot: dict.nav.pot,
  };
  const grouped: { family: ProductFamily; categories: ProductCategoryBasic[] }[] = [];
  if (filterData) {
    for (const family of FAMILY_ORDER) {
      const cats = filterData.categories.filter(cat => familyOfCategory(cat) === family);
      if (cats.length > 0) grouped.push({ family, categories: cats });
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white dark:bg-gray-950">
      <div className="container-custom mx-auto px-4 md:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {d.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {d.subtitle}
          </p>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 mb-10" />

        {/* Type sections with category circles */}
        {filterData === null ? (
          // Loading skeleton
          <div className="space-y-10">
            {[0, 1].map(i => (
              <div key={i}>
                <div className="h-7 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
                <div className="flex gap-8">
                  {[0, 1, 2, 3].map(j => (
                    <div key={j} className="flex flex-col items-center gap-2.5">
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          grouped.map((group, i) => (
            <TypeSection
              key={group.family}
              family={group.family}
              familyLabel={familyLabels[group.family]}
              categories={group.categories}
              lang={lang}
              sectionIndex={i}
            />
          ))
        )}

        {/* Confidence strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
            <div className="flex -space-x-2">
              {['#3b82f6','#8b5cf6','#06b6d4'].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white dark:border-gray-900"
                  style={{ backgroundColor: color }}
                >
                  ✓
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {d.confidence_text}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
