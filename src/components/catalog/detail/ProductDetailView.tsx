'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Image as ImageIcon, Package, Ruler, Weight, Award, Sparkles, ArrowLeft, ChevronLeft, ChevronRight, Plus, Minus, Hash, Tag, FileText } from 'lucide-react';
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

// Loading component for 3D viewer
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

// Dynamically import 3D viewer to avoid SSR issues
const Product3DViewer = dynamic(() => import('./Product3DViewer'), {
  ssr: false,
  loading: () => <Viewer3DLoading />,
});

// Accordion section component for collapsible product info panels
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
}

function AccordionSection({ title, isOpen, onToggle, children, isFirst = false }: AccordionSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-4 py-4 cursor-pointer transition-colors text-left',
          'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
          !isFirst && 'border-t border-gray-200 dark:border-gray-700'
        )}
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        {isOpen ? (
          <Minus className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        ) : (
          <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  images?: string[];
}

export default function ProductDetailView({
  product,
  allProducts,
  images = [],
}: ProductDetailViewProps) {
  const { lang, dict } = useLang();

  const [openSections, setOpenSections] = useState({
    specifications: true,
    colors: false,
    services: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get available caps from allProducts (filter caps only)
  const availableCaps = allProducts.filter(p => p.category === 'cap');

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [customColor, setCustomColor] = useState('#22c55e');
  const [isCustomBottleColor, setIsCustomBottleColor] = useState(false);
  const [selectedCap, setSelectedCap] = useState<Product | null>(null);
  const [capColor, setCapColor] = useState('#000000');
  const [customCapColor, setCustomCapColor] = useState('#000000');
  const [isCustomCapColor, setIsCustomCapColor] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [bottleScale, setBottleScale] = useState(1);
  const [capScale, setCapScale] = useState(1);
  const [capPositionY, setCapPositionY] = useState(0);

  // Embla carousel for cap selector
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });

  // Get hex color for 3D rendering
  const getHexColor = (colorName: string, customHex: string, isCustom: boolean) => {
    if (isCustom) return customHex;
    return colorToHex[colorName] || customHex;
  };

  // Use placeholder images if none provided
  const productImages = images.length > 0 ? images : [
    '/api/placeholder/800/800',
    '/api/placeholder/800/800',
    '/api/placeholder/800/800',
  ];

  const categoryPath = product.category === 'bottle' ? 'bottles' : 'caps';
  const categoryName = product.category === 'bottle' ? dict.nav.bottles : dict.nav.caps;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 md:pt-28">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom mx-auto px-3 md:px-4 py-3 md:py-6">
          <Breadcrumb
            items={[
              { label: dict.nav.home, href: `/${lang}` },
              { label: categoryName, href: `/${lang}/${categoryPath}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container-custom mx-auto px-3 md:px-4 py-6 md:py-12 lg:py-16">
        {/* Back Button */}
        <Link
          href={`/${lang}/${categoryPath}`}
          className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:gap-2 md:hover:gap-3 transition-all mb-4 md:mb-6 lg:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
          <span className="truncate">{dict.catalog.product_detail.back_to} {categoryName}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Left Column - Images / 3D (toggle) */}
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
                  <ProductGallery images={productImages} productName={product.name} />
                </motion.div>
              ) : (
                <motion.div
                  key="viewer3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 md:space-y-4"
                >
                {/* 3D Viewer */}
                <Product3DViewer
                  bottleModelUrl="/images/3d/base.glb"
                  capModelUrl={selectedCap ? "/images/3d/cap.glb" : undefined}
                  bottleColor={getHexColor(selectedColor, customColor, isCustomBottleColor)}
                  capColor={selectedCap ? getHexColor(capColor, customCapColor, isCustomCapColor) : '#000000'}
                  productCategory={product.category}
                  bottleScale={bottleScale}
                  capScale={capScale}
                  capPositionY={capPositionY}
                  productColorConfig={{
                    colors: product.colors,
                    selectedColor,
                    onColorChange: setSelectedColor,
                    customColor,
                    onCustomColorChange: setCustomColor,
                    isCustom: isCustomBottleColor,
                    onIsCustomChange: setIsCustomBottleColor,
                    label: dict.catalog.product_detail.product_color,
                  }}
                  capColorConfig={selectedCap ? {
                    colors: selectedCap.colors,
                    selectedColor: capColor,
                    onColorChange: setCapColor,
                    customColor: customCapColor,
                    onCustomColorChange: setCustomCapColor,
                    isCustom: isCustomCapColor,
                    onIsCustomChange: setIsCustomCapColor,
                    label: dict.catalog.product_detail.cap_color,
                  } : undefined}
                />

                {/* Scale Controls */}
                <div className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
                  {/* Bottle Scale Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                        Bottle Scale
                      </label>
                      <span className="text-xs md:text-sm font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded">
                        {bottleScale.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={bottleScale}
                      onChange={(e) => setBottleScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0.5x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  {/* Cap Scale Slider (only show if cap is selected) */}
                  {selectedCap && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                          Cap Scale
                        </label>
                        <span className="text-xs md:text-sm font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded">
                          {capScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={capScale}
                        onChange={(e) => setCapScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0.5x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                  )}

                  {/* Cap Position Y Slider (only show if cap is selected) */}
                  {selectedCap && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                          Cap Position Y
                        </label>
                        <span className="text-xs md:text-sm font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded">
                          {capPositionY.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.5"
                        max="0.5"
                        step="0.05"
                        value={capPositionY}
                        onChange={(e) => setCapPositionY(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>-0.5 ↓</span>
                        <span>0.5 ↑</span>
                      </div>
                    </div>
                  )}
                </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Cap Selector Carousel (only for bottles in 3D mode) */}
            {show3DPreview && product.category === 'bottle' && (
              <div className="mt-3 md:mt-6 p-3 md:p-6 rounded-xl md:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-xs md:text-base font-semibold text-gray-900 dark:text-white">
                    {dict.catalog.product_detail.combine_with_cap}
                  </h3>
                  {selectedCap && (
                    <button
                      onClick={() => setSelectedCap(null)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      {dict.catalog.product_detail.remove_cap}
                    </button>
                  )}
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {selectedCap ? `${selectedCap.name}` : `${dict.catalog.product_detail.select_cap}`}
                    </p>
                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                      <button
                        onClick={() => emblaApi?.scrollPrev()}
                        className="p-1 md:p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Previous caps"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => emblaApi?.scrollNext()}
                        className="p-1 md:p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Next caps"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden -mx-3 md:mx-0" ref={emblaRef}>
                    <div className="flex gap-2 md:gap-3 px-3 md:px-0">
                      {availableCaps.map((cap) => (
                        <div key={cap.id} className="flex-[0_0_160px] md:flex-[0_0_280px] min-w-0">
                          <button
                            onClick={() => {
                              setSelectedCap(cap);
                              setCapColor(cap.colors[0]);
                            }}
                            className={cn(
                              'w-full p-2 md:p-3 rounded-lg text-left transition-all',
                              selectedCap?.id === cap.id
                                ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                            )}
                          >
                            <div className="flex items-center gap-2 md:gap-3">
                              {cap.image ? (
                                <img
                                  src={cap.image}
                                  alt={cap.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                                  onError={(e) => { e.currentTarget.src = '/images/banners/broken-image.png'; }}
                                />
                              ) : (
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">{cap.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{cap.type}</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle 2D / 3D button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShow3DPreview(!show3DPreview)}
              className="mt-3 md:mt-6 w-full btn-outline flex items-center justify-center gap-2 md:gap-3 py-3 md:py-5 text-xs md:text-base font-semibold min-h-[44px] md:min-h-[52px]"
            >
              {show3DPreview ? (
                <>
                  <ImageIcon className="w-4 h-4 md:w-6 md:h-6" />
                  {dict.catalog.product_detail.view_gallery}
                </>
              ) : (
                <>
                  <Box className="w-4 h-4 md:w-6 md:h-6" />
                  {dict.catalog.product_detail.view_3d_preview}
                </>
              )}
            </motion.button>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8 md:sticky md:top-32 md:self-start">
            {/* Product Header */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                {product.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-gold text-white text-xs md:text-sm font-semibold">
                    <Award className="w-3 h-3 md:w-4 md:h-4" />
                    {dict.catalog.product_detail.featured}
                  </span>
                )}
                {product.bestSeller && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-500 text-white text-xs md:text-sm font-semibold">
                    {dict.catalog.product_detail.best_seller}
                  </span>
                )}
                {product.newArrival && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-semibold">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    {dict.catalog.product_detail.new_arrival}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-3 md:mb-6">
                {product.type}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dict.catalog.product_detail.product_id}: <span className="font-mono font-semibold">{product.id}</span>
              </p>
            </div>

            {/* Accordion: Specifications, Colors, Additional Services */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
              {/* Specifications */}
              <AccordionSection
                title={dict.catalog.product_detail.specifications}
                isOpen={openSections.specifications}
                onToggle={() => toggleSection('specifications')}
                isFirst
              >
                {(() => {
                  const specRows = [
                    { icon: <Hash className="w-4 h-4" />, label: dict.catalog.product_detail.product_id, value: product.id },
                    { icon: <Weight className="w-4 h-4" />, label: dict.catalog.product_detail.weight, value: `${product.dimensions.weight}g` },
                    { icon: <Ruler className="w-4 h-4" />, label: dict.catalog.product_detail.dimensions, value: `${product.dimensions.width}×${product.dimensions.height}mm` },
                    ...(product.dimensions.capacity ? [{ icon: <Package className="w-4 h-4" />, label: dict.catalog.product_detail.capacity, value: `${product.dimensions.capacity}ml` }] : []),
                    { icon: <Tag className="w-4 h-4" />, label: dict.catalog.product_detail.type, value: product.type },
                  ];
                  return (
                    <div>
                      {specRows.map((row, i) => (
                        <div
                          key={row.label}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3',
                            i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
                          )}
                        >
                          <div className="w-4 text-primary-600 dark:text-primary-400 flex-shrink-0">{row.icon}</div>
                          <span className="font-semibold w-36 text-sm text-gray-900 dark:text-white flex-shrink-0">{row.label}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </AccordionSection>

              {/* Available Colors */}
              <AccordionSection
                title={dict.catalog.product_detail.colors}
                isOpen={openSections.colors}
                onToggle={() => toggleSection('colors')}
              >
                <div className="px-4 py-4 flex flex-wrap gap-3 bg-white dark:bg-gray-900">
                  {product.colors.map(color => (
                    <div key={color} className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: colorToHex[color] || color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{color}</span>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* Additional Services */}
              <AccordionSection
                title={dict.catalog.product_detail.additional_services}
                isOpen={openSections.services}
                onToggle={() => toggleSection('services')}
              >
                <div className="px-4 py-4 space-y-3 bg-white dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        {dict.catalog.product_detail.bulk_discount_title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {dict.catalog.product_detail.bulk_discount_desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        {dict.catalog.product_detail.custom_printing_title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {dict.catalog.product_detail.custom_printing_desc}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            </div>

            {/* Order Form */}
            <OrderForm product={product} />
          </div>
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts
        currentProduct={product}
        allProducts={allProducts}
        maxItems={4}
      />
    </div>
  );
}
