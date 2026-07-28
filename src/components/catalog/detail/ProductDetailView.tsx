'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Image as ImageIcon, Package, Ruler, Weight, Award, Sparkles,
  ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus, Hash, Tag, FileText,
  Droplet, MessageCircle, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useEmblaCarousel from 'embla-carousel-react';
import { Product } from '@/types/catalog';
import { useLang } from '@/lib/LangContext';
import ProductGallery from './ProductGallery';
import { colorToHex } from './EnhancedColorPicker';
import OrderForm from './OrderForm';
import RelatedProducts from './RelatedProducts';
import Breadcrumb from '../Breadcrumb';
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

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  images?: string[];
}

export default function ProductDetailView({ product, allProducts, images = [] }: ProductDetailViewProps) {
  const { lang, dict } = useLang();
  const d = dict.catalog.product_detail;

  const [openSections, setOpenSections] = useState({ colors: true, tags: true, services: false });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const availableCaps = allProducts.filter(p => p.category === 'cap');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isCustomBottleColor, setIsCustomBottleColor] = useState(false);
  const [selectedCap, setSelectedCap] = useState<Product | null>(null);
  const [capColor, setCapColor] = useState('#000000');
  const [customCapColor, setCustomCapColor] = useState('#000000');
  const [isCustomCapColor, setIsCustomCapColor] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [bottleScale, setBottleScale] = useState(1);
  const [capScale, setCapScale] = useState(1);
  const [capPositionY, setCapPositionY] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1 });

  const getHexColor = (colorName: string, customHex: string, isCustom: boolean) =>
    isCustom ? customHex : (colorToHex[colorName] || customHex);

  const productImages = images.length > 0 ? images : [
    '/api/placeholder/800/800',
    '/api/placeholder/800/800',
    '/api/placeholder/800/800',
  ];

  const categoryPath = product.category === 'bottle' ? 'bottles' : 'caps';
  const categoryName = product.category === 'bottle' ? dict.nav.bottles : dict.nav.caps;

  // Tags derived from product data
  const tags = [
    product.category === 'bottle' ? { label: dict.nav.bottles, style: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' } : { label: dict.nav.caps, style: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    { label: product.type, style: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
    ...(product.featured ? [{ label: d.featured, style: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' }] : []),
    ...(product.bestSeller ? [{ label: d.best_seller, style: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' }] : []),
    ...(product.newArrival ? [{ label: d.new_arrival, style: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' }] : []),
  ];

  // Spec rows
  const specRows = [
    { icon: <Hash className="w-4 h-4" />, label: d.product_id, value: product.id },
    { icon: <Weight className="w-4 h-4" />, label: d.weight, value: `${product.dimensions.weight} g` },
    { icon: <Ruler className="w-4 h-4" />, label: d.dimensions, value: `${product.dimensions.width} × ${product.dimensions.height} mm` },
    ...(product.dimensions.capacity ? [{ icon: <Package className="w-4 h-4" />, label: d.capacity, value: `${product.dimensions.capacity} ml` }] : []),
    { icon: <Tag className="w-4 h-4" />, label: d.type, value: product.type },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 md:pt-28">

      {/* ── Breadcrumb bar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom mx-auto px-4 py-3 md:py-4">
          <Breadcrumb
            items={[
              { label: dict.nav.home, href: `/${lang}` },
              { label: categoryName, href: `/${lang}/${categoryPath}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* ── Main section ── */}
      <section className="container-custom mx-auto px-4 py-8 md:py-12 lg:py-16">

        {/* Back button */}
        <Link
          href={`/${lang}/products/${categoryPath}`}
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
                <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <ProductGallery images={productImages} productName={product.name} />
                </motion.div>
              ) : (
                <motion.div key="viewer3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <Product3DViewer
                    bottleModelUrl="/images/3d/base.glb"
                    bottleColor={getHexColor(selectedColor, customColor, isCustomBottleColor)}
                    bottleScale={bottleScale}
                    layers={selectedCap ? [{
                      key: 'cap',
                      url: '/images/3d/cap.glb',
                      color: getHexColor(capColor, customCapColor, isCustomCapColor),
                      scale: capScale,
                      positionY: capPositionY,
                    }] : []}
                  />

                  {/* Scale controls */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                    {[
                      { label: d.bottle_scale, value: bottleScale, setter: setBottleScale, show: true },
                      { label: d.cap_scale, value: capScale, setter: setCapScale, show: !!selectedCap },
                      { label: d.cap_position_y, value: capPositionY, setter: setCapPositionY, show: !!selectedCap, min: -0.5, max: 0.5, step: 0.05 },
                    ].filter(s => s.show).map(s => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</label>
                          <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded">
                            {s.value.toFixed(2)}{s.min === undefined ? 'x' : ''}
                          </span>
                        </div>
                        <input type="range" min={s.min ?? 0.5} max={s.max ?? 2} step={s.step ?? 0.1}
                          value={s.value} onChange={e => s.setter(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cap selector carousel (3D + bottle only) */}
            {show3DPreview && product.category === 'bottle' && (
              <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{d.combine_with_cap}</h3>
                  <div className="flex items-center gap-2">
                    {selectedCap && (
                      <button onClick={() => setSelectedCap(null)} className="text-xs text-red-500 dark:text-red-400 hover:underline">
                        {d.remove_cap}
                      </button>
                    )}
                    <button onClick={() => emblaApi?.scrollPrev()} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button onClick={() => emblaApi?.scrollNext()} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {selectedCap ? selectedCap.name : d.select_cap}
                </p>
                <div className="overflow-hidden -mx-2" ref={emblaRef}>
                  <div className="flex gap-2 px-2">
                    {availableCaps.map(cap => (
                      <div key={cap.id} className="flex-[0_0_200px] min-w-0">
                        <button
                          onClick={() => { setSelectedCap(cap); setCapColor(cap.colors[0]); }}
                          className={cn(
                            'w-full p-3 rounded-xl text-left transition-all border',
                            selectedCap?.id === cap.id
                              ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-400'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {cap.image ? (
                              <img src={cap.image} alt={cap.name}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                                onError={e => { e.currentTarget.src = '/images/banners/broken-image.png'; }} />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{cap.name}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{cap.type}</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Toggle 2D / 3D */}
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
          </div>

          {/* ══ RIGHT: Product info (sticky) ══ */}
          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">

            {/* ── Product header ── */}
            <div>
              {/* Category + badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                  product.category === 'bottle'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                )}>
                  {product.category === 'bottle' ? <Droplet className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                  {categoryName}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-semibold">
                    <Award className="w-3 h-3" />{d.featured}
                  </span>
                )}
                {product.bestSeller && (
                  <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                    {d.best_seller}
                  </span>
                )}
                {product.newArrival && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />{d.new_arrival}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                {product.name}
              </h1>

              {/* Type + ID */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">{product.type}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-mono font-semibold">
                  <Hash className="w-3 h-3" />{product.id}
                </span>
              </div>
            </div>

            {/* ── Specification table card ── */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
              {/* Card header */}
              <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {d.specifications}
                </span>
              </div>

              {/* Rows */}
              {specRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'grid grid-cols-[auto_1fr] items-center border-b border-gray-50 dark:border-gray-800/60 last:border-0',
                    i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-800/30'
                  )}
                >
                  {/* Label cell */}
                  <div className="flex items-center gap-2.5 px-5 py-3.5 w-40 md:w-44 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <span className="text-primary-500 dark:text-primary-400 flex-shrink-0">{row.icon}</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-tight">{row.label}</span>
                  </div>
                  {/* Value cell */}
                  <div className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Accordions card ── */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">

              {/* Colors */}
              <AccordionSection
                title={d.colors}
                isOpen={openSections.colors}
                onToggle={() => toggleSection('colors')}
                isFirst
                badge={product.colors.length}
              >
                <div className="px-5 py-4 grid grid-cols-2 gap-2.5 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800/60">
                  {product.colors.map(color => (
                    <div key={color} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: colorToHex[color] || '#9ca3af' }}
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{color}</span>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* Tags */}
              <AccordionSection
                title={d.tags}
                isOpen={openSections.tags}
                onToggle={() => toggleSection('tags')}
                badge={tags.length}
              >
                <div className="px-5 py-4 flex flex-wrap gap-2 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800/60">
                  {tags.map((tag, i) => (
                    <span key={i} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', tag.style)}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </AccordionSection>

              {/* Additional Services */}
              <AccordionSection
                title={d.additional_services}
                isOpen={openSections.services}
                onToggle={() => toggleSection('services')}
              >
                <div className="px-5 py-4 space-y-3 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800/60">
                  {[
                    { title: d.bulk_discount_title, desc: d.bulk_discount_desc },
                    { title: d.custom_printing_title, desc: d.custom_printing_desc },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-primary-50/60 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30">
                      <FileText className="w-4 h-4 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            </div>

            {/* ── Action area ── */}
            <div className="space-y-3">
              <OrderForm product={product} />

              <motion.a
                href={`mailto:fanalriansyah@gmail.com?subject=Product Inquiry: ${encodeURIComponent(product.name)}&body=Hi, I'm interested in ${encodeURIComponent(product.name)} (${product.id}). Please send me more information.`}
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
      <RelatedProducts currentProduct={product} allProducts={allProducts} maxItems={4} />
    </div>
  );
}
