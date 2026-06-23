'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Image as ImageIcon, Package, ArrowLeft,
  ChevronDown, MessageCircle, ShoppingBag, Tag,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductDetail, ProductListItem } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import ProductGallery from './ProductGallery';
import Breadcrumb from '../Breadcrumb';
import ApiProductCard from '../ApiProductCard';
import { cn } from '@/lib/utils';

function Viewer3DLoading() {
  const { dict } = useLang();
  return (
    <div className="w-full aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Box className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{dict.catalog.product_detail.loading_3d_viewer}</p>
      </div>
    </div>
  );
}

const Product3DViewer = dynamic(() => import('./Product3DViewer'), {
  ssr: false,
  loading: () => <Viewer3DLoading />,
});

// ── Accordion ─────────────────────────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
  badge?: number;
}

function AccordionSection({ title, isOpen, onToggle, children, isFirst = false, badge }: AccordionSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors text-left',
          'hover:bg-gray-50 dark:hover:bg-gray-800/60',
          !isFirst && 'border-t border-gray-100 dark:border-gray-800'
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-gray-800 dark:text-white">{title}</span>
          {badge !== undefined && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-bold">
              {badge}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface ApiProductDetailViewProps {
  product: ProductDetail;
  relatedProducts: ProductListItem[];
}

export default function ApiProductDetailView({ product, relatedProducts }: ApiProductDetailViewProps) {
  const { lang, dict } = useLang();
  const d = dict.catalog.product_detail;

  const [show3DPreview, setShow3DPreview] = useState(false);
  const [openDescription, setOpenDescription] = useState(true);
  const [openAttributes, setOpenAttributes] = useState(true);

  const isBottle = product.type.name_en.toLowerCase() === 'bottle';
  const categoryPath = isBottle ? 'bottles' : 'caps';
  const categoryName = lang === 'id' ? product.type.name_id : product.type.name_en;
  const productName = lang === 'id' ? product.name_id : product.name_en;

  const description = product.description
    ? (lang === 'id' ? product.description.long_id : product.description.long_en)
    : null;

  // Build image URLs list
  const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
  const imageUrls = sortedImages.map((img) => img.file_path);

  // Sorted attributes
  const sortedAttributes = [...product.attributes].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 md:pt-28">

      {/* ── Breadcrumb bar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom mx-auto px-4 py-3 md:py-4">
          <Breadcrumb
            items={[
              { label: dict.nav.home, href: `/${lang}` },
              { label: categoryName, href: `/${lang}/${categoryPath}` },
              { label: productName },
            ]}
          />
        </div>
      </div>

      {/* ── Main section ── */}
      <section className="container-custom mx-auto px-4 py-8 md:py-12 lg:py-16">

        {/* Back button */}
        <Link
          href={`/${lang}/${categoryPath}`}
          className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:gap-3 transition-all mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
          {d.back_to} {categoryName}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* ══ LEFT: Gallery / 3D ══ */}
          <div>
            <AnimatePresence mode="wait">
              {!show3DPreview ? (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {imageUrls.length > 0 ? (
                    <ProductGallery images={imageUrls} productName={productName} />
                  ) : (
                    <div className="aspect-square rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-300 dark:text-gray-700" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="viewer3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Product3DViewer
                    bottleModelUrl={product.three_d_file_path ?? '/images/3d/base.glb'}
                    bottleColor="#22c55e"
                    capColor="#000000"
                    productCategory={isBottle ? 'bottle' : 'cap'}
                    bottleScale={1}
                    capScale={1}
                    capPositionY={0}
                    productColorConfig={{
                      colors: [],
                      selectedColor: '',
                      onColorChange: () => undefined,
                      customColor: '#22c55e',
                      onCustomColorChange: () => undefined,
                      isCustom: false,
                      onIsCustomChange: () => undefined,
                      label: d.product_color,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle 2D / 3D — only show if 3D file exists */}
            {product.three_d_file_path && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShow3DPreview(!show3DPreview)}
                className="mt-4 w-full btn-outline flex items-center justify-center gap-2 py-4 text-sm font-semibold"
              >
                {show3DPreview ? (
                  <><ImageIcon className="w-5 h-5" />{d.view_gallery}</>
                ) : (
                  <><Box className="w-5 h-5" />{d.view_3d_preview}</>
                )}
              </motion.button>
            )}
          </div>

          {/* ══ RIGHT: Product info (sticky) ══ */}
          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">

            {/* ── Product header ── */}
            <div>
              {/* Type + category badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  <Tag className="w-3 h-3" />
                  {lang === 'id' ? product.type.name_id : product.type.name_en}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {lang === 'id' ? product.category.name_id : product.category.name_en}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                {productName}
              </h1>
            </div>

            {/* ── Specification / Attributes table card ── */}
            {sortedAttributes.length > 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                {/* Card header */}
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {d.specifications}
                  </span>
                </div>

                {/* Attribute rows */}
                {sortedAttributes.map((attr, i) => (
                  <motion.div
                    key={attr.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'grid grid-cols-[auto_1fr] items-center border-b border-gray-50 dark:border-gray-800/60 last:border-0',
                      i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-800/30'
                    )}
                  >
                    <div className="flex items-center gap-2.5 px-5 py-3.5 w-40 md:w-44 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-tight">
                        {lang === 'id' ? attr.label_id : attr.label_en}
                      </span>
                    </div>
                    <div className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{attr.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── Description accordion card ── */}
            {description && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <AccordionSection
                  title="Description"
                  isOpen={openDescription}
                  onToggle={() => setOpenDescription((v) => !v)}
                  isFirst
                >
                  <div className="px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800/60">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                </AccordionSection>
              </div>
            )}

            {/* ── Short description if no long desc ── */}
            {!description && product.description && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <AccordionSection
                  title="Description"
                  isOpen={openAttributes}
                  onToggle={() => setOpenAttributes((v) => !v)}
                  isFirst
                >
                  <div className="px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800/60">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {lang === 'id' ? product.description.short_id : product.description.short_en}
                    </p>
                  </div>
                </AccordionSection>
              </div>
            )}

            {/* ── Action area ── */}
            <div className="space-y-3">
              {/* Shopee / Tokopedia links */}
              {product.shopee_url && (
                <motion.a
                  href={product.shopee_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-outline w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Buy on Shopee
                </motion.a>
              )}
              {product.tokopedia_url && (
                <motion.a
                  href={product.tokopedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-outline w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Buy on Tokopedia
                </motion.a>
              )}

              {/* Inquiry button */}
              <motion.a
                href={`mailto:fanalriansyah@gmail.com?subject=Product Inquiry: ${encodeURIComponent(productName)}&body=Hi, I'm interested in ${encodeURIComponent(productName)} (${product.id}). Please send me more information.`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                {d.inquiry}
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="container-custom mx-auto px-4 pb-16 md:pb-20">
          <div className="border-t border-gray-200 dark:border-gray-800 pt-12 md:pt-16">
            <div className="mb-6 md:mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {d.related_products}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                {d.related_desc}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item, index) => (
                <ApiProductCard key={item.id} product={item} lang={lang} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
