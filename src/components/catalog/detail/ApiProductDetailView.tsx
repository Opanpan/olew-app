'use client';

import { useState, useRef, Component, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Image as ImageIcon, Package, ArrowLeft, ArrowRight,
  ChevronDown, MessageCircle, Tag, Heart, Share2, Link2, ArrowLeftRight, Check, X, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductDetail, ProductListItem, ProductCompatibility, getProductDetail } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useLike, useShare } from '@/hooks/useProductActions';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem } from '@/lib/CompareContext';
import ProductGallery from './ProductGallery';
import Breadcrumb from '../Breadcrumb';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';
import ApiProductCard from '../ApiProductCard';
import { PLASTIC_COLORS, colorToHex } from './EnhancedColorPicker';
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

// Rendered outside the canvas now, but kept in the same dynamically-imported,
// SSR-disabled module as Product3DViewer since that file has browser-only
// top-level side effects (useGLTF.preload).
const ColorSwatchPanel = dynamic(
  () => import('./Product3DViewer').then((mod) => mod.ColorSwatchPanel),
  { ssr: false }
);

// Resolve a 3D model URL — fall back to a local dummy GLB when the API returns
// a mock/placeholder URL (cdn.example.com) or an empty value, so the model still renders.
function resolve3DUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.includes('cdn.example.com')) return fallback;
  if (!/\.glb($|\?)/i.test(url)) return fallback;
  return url;
}

// Simple error boundary to catch GLB load failures so the canvas doesn't crash/flicker.
interface EBState { hasError: boolean }
class Viewer3DErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, EBState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="w-full aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">3D preview unavailable</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  compatibility?: ProductCompatibility | null;
}

export default function ApiProductDetailView({ product, relatedProducts, compatibility }: ApiProductDetailViewProps) {
  const { lang, dict } = useLang();
  const d = dict.catalog.product_detail;

  const [show3DPreview, setShow3DPreview] = useState(false);
  const [openDescription, setOpenDescription] = useState(true);
  const [openAttributes, setOpenAttributes] = useState(true);

  // Compatible product inline preview
  const compatScrollRef = useRef<HTMLDivElement>(null);
  const compatDrag = useRef({ active: false, hasDragged: false, startX: 0, scrollLeft: 0 });
  const [selectedCompatId, setSelectedCompatId] = useState<string | null>(null);
  const [compatPreview, setCompatPreview] = useState<ProductDetail | null>(null);
  const [compatLoading, setCompatLoading] = useState(false);

  // Selected compatible item for 3D overlay
  const selectedCompatItem = compatibility?.compatible.find(c => c.id === selectedCompatId) ?? null;

  const handleCompatClick = async (id: string) => {
    if (selectedCompatId === id) {
      setSelectedCompatId(null);
      setCompatPreview(null);
      setCapPositionY(0);
      return;
    }
    setSelectedCompatId(id);
    setCompatLoading(true);
    setCompatPreview(null);
    setCapPositionY(0);
    const detail = await getProductDetail(id);
    setCompatPreview(detail);
    setCompatLoading(false);
  };

  // Scale and horizontal alignment are admin-configured for this specific model
  // pairing (not a customer preference), so they're applied as fixed values from
  // the API response rather than exposed as sliders.
  const capScale = selectedCompatItem?.scale ?? 1;
  const capOffsetX = selectedCompatItem?.position?.x ?? 0;
  const capOffsetZ = selectedCompatItem?.position?.z ?? 0;
  // Guard against a misconfigured admin range (min === max, or min > max) collapsing
  // the slider to zero width and making it impossible to drag.
  const rawPositionYMin = selectedCompatItem?.min_position_vertical ?? -1;
  const rawPositionYMax = selectedCompatItem?.max_position_vertical ?? 2;
  const hasValidRange = rawPositionYMin < rawPositionYMax;
  const capPositionYMin = hasValidRange ? rawPositionYMin : -1;
  const capPositionYMax = hasValidRange ? rawPositionYMax : 2;

  // Color state for 3D viewer
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isCustomColor, setIsCustomColor] = useState(true);
  const [selectedColorName, setSelectedColorName] = useState('');
  const [capColor, setCapColor] = useState('#ffffff');
  const [isCustomCapColor, setIsCustomCapColor] = useState(true);
  const [selectedCapColorName, setSelectedCapColorName] = useState('');
  // Suspends orbit drag while a color picker (now rendered below the canvas) is open
  const [anyPickerOpen, setAnyPickerOpen] = useState(false);

  const handleColorPresetSelect = (name: string) => {
    setSelectedColorName(name);
    setCustomColor(colorToHex[name] ?? '#ffffff');
  };
  const handleCapColorPresetSelect = (name: string) => {
    setSelectedCapColorName(name);
    setCapColor(colorToHex[name] ?? '#ffffff');
  };

  // Cap vertical position slider for mix-and-match (bounded by admin-configured range)
  const [capPositionY, setCapPositionY] = useState(0);

  const isBottle = product.type.name_en.toLowerCase() === 'bottle';
  const categoryPath = isBottle ? 'bottles' : 'caps';
  const categoryName = lang === 'id' ? product.type.name_id : product.type.name_en;
  const productName = lang === 'id' ? product.name_id : product.name_en;
  const pc = dict.catalog.product_card;

  // Like, share & compare — must be after productName is defined
  const { liked, toggle: toggleLike } = useLike(product.id);
  const { share, copied } = useShare(productName);
  const { toggle: toggleCompare, has: hasCompare, canAdd } = useCompare();
  const isComparing = hasCompare(product.id);
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const handleCompare = () => {
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.images.find(i => i.is_thumbnail)?.file_path ?? product.images[0]?.file_path,
    };
    const ok = toggleCompare(item);
    if (!ok) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2500);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 lg:gap-12">

          {/* ══ LEFT: Gallery / 3D ══ */}
          <div className="max-w-[420px] w-full mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              {!show3DPreview ? (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductGallery images={imageUrls.length > 0 ? imageUrls : ['']} productName={productName} />
                </motion.div>
              ) : (
                <motion.div
                  key="viewer3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* ── Single canvas: bottle + cap together ── */}
                  <Viewer3DErrorBoundary>
                    <Product3DViewer
                      bottleModelUrl={product.three_d_file_path || '/images/3d/base.glb'}
                      capModelUrl={
                        compatPreview?.three_d_file_path || (selectedCompatItem ? '/images/3d/cap.glb' : undefined)
                      }
                      bottleColor={customColor}
                      capColor={capColor}
                      productCategory={isBottle ? 'bottle' : 'cap'}
                      bottleScale={1}
                      capScale={capScale}
                      capPositionY={capPositionY}
                      capPositionX={capOffsetX}
                      capPositionZ={capOffsetZ}
                      orbitEnabled={!anyPickerOpen}
                    />
                  </Viewer3DErrorBoundary>

                  {/* ── Color pickers — kept below the canvas so it doesn't crowd the 3D view ── */}
                  <div className={cn('flex gap-2', selectedCompatItem ? 'justify-between' : 'justify-start')}>
                    <ColorSwatchPanel
                      config={{
                        colors: PLASTIC_COLORS,
                        selectedColor: selectedColorName,
                        onColorChange: handleColorPresetSelect,
                        customColor,
                        onCustomColorChange: setCustomColor,
                        isCustom: isCustomColor,
                        onIsCustomChange: setIsCustomColor,
                        label: d.product_color,
                      }}
                      onOpenChange={setAnyPickerOpen}
                    />
                    {selectedCompatItem && (
                      <ColorSwatchPanel
                        config={{
                          colors: PLASTIC_COLORS,
                          selectedColor: selectedCapColorName,
                          onColorChange: handleCapColorPresetSelect,
                          customColor: capColor,
                          onCustomColorChange: setCapColor,
                          isCustom: isCustomCapColor,
                          onIsCustomChange: setIsCustomCapColor,
                          label: d.cap_color,
                        }}
                        onOpenChange={setAnyPickerOpen}
                      />
                    )}
                  </div>

                  {/* ── Position slider (shown when a cap is selected) ── */}
                  {selectedCompatItem && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                      <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {lang === 'id' ? 'Sesuaikan Tutup' : 'Adjust Cap'}
                      </p>
                      {[
                        { label: lang === 'id' ? 'Posisi Tutup' : 'Cap Position', value: capPositionY, setter: setCapPositionY, min: capPositionYMin, max: capPositionYMax, step: 0.05 },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-white">{s.label}</label>
                            <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded">
                              {s.value.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={s.min}
                            max={s.max}
                            step={s.step}
                            value={s.value}
                            onChange={e => s.setter(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                  <>
                    <Box className="w-5 h-5" />
                    {d.view_3d_preview}
                    {selectedCompatItem && (
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500 text-white">
                        + {lang === 'id' ? selectedCompatItem.name_id : selectedCompatItem.name_en}
                      </span>
                    )}
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* ══ RIGHT: Product info (sticky) ══ */}
          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start min-w-0">

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

              {/* Title + like/share row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  {productName}
                </h1>

                {/* Like & Share */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  {/* Like */}
                  <motion.button
                    onClick={toggleLike}
                    whileTap={{ scale: 0.85 }}
                    aria-label={liked ? pc.liked : pc.like}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300',
                      liked
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-500'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-500'
                    )}
                  >
                    <Heart className={cn('w-4 h-4 transition-all', liked && 'fill-red-500')} />
                    <span className="hidden sm:inline">{liked ? pc.liked : pc.like}</span>
                  </motion.button>

                  {/* Share */}
                  <motion.button
                    onClick={share}
                    whileTap={{ scale: 0.85 }}
                    aria-label={pc.share}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-all duration-300"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-primary-600">
                          <Link2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{pc.share_copied}</span>
                        </motion.span>
                      ) : (
                        <motion.span key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{pc.share}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
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

            {/* ── Compatible Products ── */}
            {compatibility && compatibility.compatible.length > 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                {/* Header */}
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {lang === 'id' ? 'Produk Kompatibel' : 'Compatible Products'}
                  </span>
                  <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                    {compatibility.compatible.length}
                  </span>
                </div>

                {/* Horizontal scroll list */}
                <div
                  ref={compatScrollRef}
                  className="p-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={(e) => {
                    const el = compatScrollRef.current;
                    if (!el) return;
                    compatDrag.current = { active: true, hasDragged: false, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
                  }}
                  onMouseMove={(e) => {
                    const el = compatScrollRef.current;
                    if (!el || !compatDrag.current.active) return;
                    e.preventDefault();
                    const x = e.pageX - el.offsetLeft;
                    const delta = x - compatDrag.current.startX;
                    if (Math.abs(delta) > 4) compatDrag.current.hasDragged = true;
                    el.scrollLeft = compatDrag.current.scrollLeft - delta;
                  }}
                  onMouseUp={() => { compatDrag.current.active = false; }}
                  onMouseLeave={() => { compatDrag.current.active = false; }}
                >
                  <div className="flex gap-3">
                    {compatibility.compatible.map((item) => {
                      const name = lang === 'id' ? item.name_id : item.name_en;
                      const isSelected = selectedCompatId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { if (!compatDrag.current.hasDragged) handleCompatClick(item.id); }}
                          className={cn(
                            'flex-shrink-0 flex flex-col items-center gap-2 p-3 w-28 rounded-xl border transition-all duration-200 group',
                            isSelected
                              ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-400 dark:border-primary-500'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                          )}
                        >
                          <div className={cn(
                            'w-12 h-12 rounded-lg border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-white dark:bg-gray-800 border-primary-300'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 group-hover:border-primary-300'
                          )}>
                            <Package className={cn('w-6 h-6 transition-colors', isSelected ? 'text-primary-500' : 'text-gray-300 dark:text-gray-500 group-hover:text-primary-400')} />
                          </div>
                          <span className={cn('text-[10px] font-semibold text-center leading-tight line-clamp-2 transition-colors', isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-600')}>
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inline preview panel */}
                <AnimatePresence>
                  {selectedCompatId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                    >
                      <div className="p-4">
                        {compatLoading ? (
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                            </div>
                          </div>
                        ) : compatPreview ? (
                          <div className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                              <ImgWithFallback
                                src={compatPreview.images.find(i => i.is_thumbnail)?.file_path ?? compatPreview.images[0]?.file_path}
                                alt={lang === 'id' ? compatPreview.name_id : compatPreview.name_en}
                                fallback={PRODUCT_PLACEHOLDER}
                                className="w-full h-full object-contain p-2"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                {lang === 'id' ? compatPreview.type.name_id : compatPreview.type.name_en}
                                {' · '}
                                {lang === 'id' ? compatPreview.category.name_id : compatPreview.category.name_en}
                              </p>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                                {lang === 'id' ? compatPreview.name_id : compatPreview.name_en}
                              </p>
                              {compatPreview.attributes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {compatPreview.attributes.slice(0, 3).map(a => (
                                    <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                                      {a.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <Link
                                href={`/${lang}/products/${compatPreview.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {dict.catalog.product_card.view_details}
                              </Link>
                            </div>

                            {/* Close */}
                            <button
                              onClick={() => { setSelectedCompatId(null); setCompatPreview(null); }}
                              className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 self-start"
                            >
                              <X className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Action area ── */}
            <div className="space-y-3">
              {/* Marketplace buttons — always visible, disabled when URL not yet available */}
              <div className="grid grid-cols-2 gap-3">
                {/* Shopee */}
                {product.shopee_url ? (
                  <motion.a
                    href={product.shopee_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 border-[#EE4D2D]/40 bg-[#EE4D2D]/5 hover:bg-[#EE4D2D]/10 hover:border-[#EE4D2D] transition-all duration-200 group"
                  >
                    {/* Shopee icon */}
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none">
                      <rect width="24" height="24" rx="6" fill="#EE4D2D"/>
                      <path d="M12 4C9.8 4 8 5.8 8 8H6.5C5.7 8 5 8.6 5 9.5L5.8 18.5C5.9 19.3 6.6 20 7.4 20H16.6C17.4 20 18.1 19.3 18.2 18.5L19 9.5C19 8.6 18.3 8 17.5 8H16C16 5.8 14.2 4 12 4ZM12 5.5C13.4 5.5 14.5 6.6 14.5 8H9.5C9.5 6.6 10.6 5.5 12 5.5ZM12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12Z" fill="white"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#EE4D2D]/70 font-medium leading-none mb-0.5">Beli di</p>
                      <p className="text-sm font-bold text-[#EE4D2D] leading-none">Shopee</p>
                    </div>
                    <svg className="w-3.5 h-3.5 ml-auto text-[#EE4D2D]/50 group-hover:text-[#EE4D2D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </motion.a>
                ) : (
                  <div className="relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0 grayscale" fill="none">
                      <rect width="24" height="24" rx="6" fill="#EE4D2D"/>
                      <path d="M12 4C9.8 4 8 5.8 8 8H6.5C5.7 8 5 8.6 5 9.5L5.8 18.5C5.9 19.3 6.6 20 7.4 20H16.6C17.4 20 18.1 19.3 18.2 18.5L19 9.5C19 8.6 18.3 8 17.5 8H16C16 5.8 14.2 4 12 4ZM12 5.5C13.4 5.5 14.5 6.6 14.5 8H9.5C9.5 6.6 10.6 5.5 12 5.5ZM12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12Z" fill="white"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Beli di</p>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-none">Shopee</p>
                    </div>
                    <span className="ml-auto text-[9px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Segera</span>
                  </div>
                )}

                {/* Tokopedia */}
                {product.tokopedia_url ? (
                  <motion.a
                    href={product.tokopedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 border-[#00AA5B]/40 bg-[#00AA5B]/5 hover:bg-[#00AA5B]/10 hover:border-[#00AA5B] transition-all duration-200 group"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none">
                      <rect width="24" height="24" rx="6" fill="#00AA5B"/>
                      <path d="M12 3L5 7V12C5 15.55 8.08 18.9 12 20C15.92 18.9 19 15.55 19 12V7L12 3Z" fill="white" opacity="0.9"/>
                      <path d="M10 11.5L11.5 13L14.5 10" stroke="#00AA5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#00AA5B]/70 font-medium leading-none mb-0.5">Beli di</p>
                      <p className="text-sm font-bold text-[#00AA5B] leading-none">Tokopedia</p>
                    </div>
                    <svg className="w-3.5 h-3.5 ml-auto text-[#00AA5B]/50 group-hover:text-[#00AA5B] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </motion.a>
                ) : (
                  <div className="relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0 grayscale" fill="none">
                      <rect width="24" height="24" rx="6" fill="#00AA5B"/>
                      <path d="M12 3L5 7V12C5 15.55 8.08 18.9 12 20C15.92 18.9 19 15.55 19 12V7L12 3Z" fill="white" opacity="0.9"/>
                      <path d="M10 11.5L11.5 13L14.5 10" stroke="#00AA5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Beli di</p>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-none">Tokopedia</p>
                    </div>
                    <span className="ml-auto text-[9px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Segera</span>
                  </div>
                )}
              </div>

              {/* Compare button */}
              <AnimatePresence mode="wait">
                {showMaxMsg ? (
                  <motion.div
                    key="max"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center text-sm font-medium text-amber-700 dark:text-amber-300"
                  >
                    {dict.catalog.compare.max_reached}
                  </motion.div>
                ) : (
                  <motion.button
                    key="compare"
                    onClick={handleCompare}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all duration-300',
                      isComparing
                        ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/25'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                    )}
                  >
                    {isComparing
                      ? <><Check className="w-4 h-4" />{dict.catalog.compare.added}</>
                      : <><ArrowLeftRight className="w-4 h-4" />{dict.catalog.compare.toggle}</>
                    }
                  </motion.button>
                )}
              </AnimatePresence>

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
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-8 md:mb-10">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
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
                href={`/${lang}/${isBottle ? 'bottles' : 'caps'}`}
                className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:gap-3 transition-all font-medium group flex-shrink-0 mt-1"
              >
                {d.view_all}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Grid — up to 6 items, responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {relatedProducts.map((item, index) => (
                <ApiProductCard key={item.id} product={item} lang={lang} index={index} />
              ))}
            </div>

            {/* Mobile view-all button */}
            <Link
              href={`/${lang}/${isBottle ? 'bottles' : 'caps'}`}
              className="md:hidden mt-8 btn-outline w-full flex items-center justify-center gap-2 py-4 min-h-[48px]"
            >
              {d.view_all_products}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
