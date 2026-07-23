'use client';

import { useState, useRef, useMemo, useEffect, Component, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Image as ImageIcon, Package, ArrowLeft, ArrowRight,
  ChevronDown, MessageCircle, Tag, Heart, Share2, Link2, ArrowLeftRight, Check, X, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductDetail, ProductListItem, ProductCompatibility, CompatibleProduct, getProductDetail } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useLike, useShare } from '@/hooks/useProductActions';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem, CompareConfig } from '@/lib/CompareContext';
import ProductGallery from './ProductGallery';
import Breadcrumb from '../Breadcrumb';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';
import ApiProductCard from '../ApiProductCard';
import { PRODUCT_COLORS, colorToHex } from './EnhancedColorPicker';
import { classifyFamily, familyToSlug } from '@/lib/productTaxonomy';
import { productPath } from '@/lib/seo';
import { cn, validGlbUrl } from '@/lib/utils';

const Product3DViewer = dynamic(() => import('./Product3DViewer'), {
  ssr: false,
});

// Rendered outside the canvas now, but kept in the same dynamically-imported,
// SSR-disabled module as Product3DViewer since that file has browser-only
// top-level side effects (useGLTF.preload).
const ColorSwatchPanel = dynamic(
  () => import('./Product3DViewer').then((mod) => mod.ColorSwatchPanel),
  { ssr: false }
);

// Mix-and-match roles a compatible item can occupy. Classified by the linked
// product's own product_type (no backend field needed) — "cap" is also the
// fallback while classification is loading, and for anything that isn't an
// Outer/Inner Pot, which preserves plain Bottle+Cap behavior unchanged.
const COMPAT_ROLES = ['cap', 'outer_pot', 'inner_pot'] as const;
type CompatRole = typeof COMPAT_ROLES[number];
// Max upward position offset (real 3D units) a customer can raise a layer from
// its default position. The slider shows this value directly — no normalization.
const POSITION_MAX = 1.5;
const ROLE_LABELS: Record<CompatRole, { en: string; id: string }> = {
  cap: { en: 'Cap', id: 'Tutup' },
  outer_pot: { en: 'Outer Pot', id: 'Pot Luar' },
  inner_pot: { en: 'Inner Pot', id: 'Pot Dalam' },
};
function emptyByRole<T>(value: T): Record<CompatRole, T> {
  return { cap: value, outer_pot: value, inner_pot: value };
}
function classifyByTypeName(typeName: string | undefined): CompatRole {
  const n = (typeName ?? '').trim().toLowerCase();
  if (n === 'outer pot') return 'outer_pot';
  if (n === 'inner pot') return 'inner_pot';
  return 'cap';
}

// Treat a mock/placeholder URL (cdn.example.com) or anything that isn't a real
// .glb as "no model" — the viewer shows an unavailable/loading state instead of
// trying to load it, rather than silently substituting a generic stand-in model.
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

// ── Compatible-products section, one instance per role (Cap / Outer Pot / Inner Pot) ──

function CompatRoleSection({
  role, items, thumbs, selectedId, preview, loading, onSelect, onClear,
}: {
  role: CompatRole;
  items: CompatibleProduct[];
  thumbs: Record<string, string | undefined>;
  selectedId: string | null;
  preview: ProductDetail | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  const { lang, dict } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, hasDragged: false, startX: 0, scrollLeft: 0 });

  // Vertical mouse-wheel scrolls the row horizontally. Attached as a non-passive
  // native listener so preventDefault works (React's onWheel is passive), and only
  // hijacks the page scroll while the row actually has horizontal overflow.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          {lang === 'id' ? ROLE_LABELS[role].id : ROLE_LABELS[role].en}
        </span>
        <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Horizontal scroll list */}
      <div
        ref={scrollRef}
        className="px-4 pt-4 pb-3 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => {
          const el = scrollRef.current;
          if (!el) return;
          drag.current = { active: true, hasDragged: false, startX: e.clientX, scrollLeft: el.scrollLeft };

          // Bind move/up to window so the drag keeps tracking even when the cursor
          // leaves the row or outruns it, and always releases cleanly.
          const onMove = (ev: MouseEvent) => {
            if (!drag.current.active) return;
            ev.preventDefault();
            const delta = ev.clientX - drag.current.startX;
            if (Math.abs(delta) > 4) drag.current.hasDragged = true;
            el.scrollLeft = drag.current.scrollLeft - delta;
          };
          const onUp = () => {
            drag.current.active = false;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        <div className="flex gap-4 items-start">
          {items.map((item) => {
            const name = lang === 'id' ? item.name_id : item.name_en;
            const isSelected = selectedId === item.id;
            const thumb = thumbs[item.id];
            return (
              <button
                key={item.id}
                onClick={() => { if (!drag.current.hasDragged) onSelect(item.id); }}
                className={cn(
                  'group relative flex-shrink-0 w-44 rounded-2xl overflow-hidden border text-left transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10',
                  isSelected
                    ? 'border-primary-400 dark:border-primary-500 ring-2 ring-primary-400/40 shadow-lg shadow-primary-500/15'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                )}
              >
                {/* Full product image — fixed square, independent of title height */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  {thumb ? (
                    <ImgWithFallback
                      src={thumb}
                      alt={name}
                      fallback={PRODUCT_PLACEHOLDER}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className={cn('w-10 h-10 transition-colors', isSelected ? 'text-primary-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-primary-400')} />
                    </div>
                  )}
                  {/* Selected checkmark badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-primary-500 shadow-lg shadow-primary-500/40 flex items-center justify-center ring-2 ring-white dark:ring-gray-900"
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Name footer */}
                <div className={cn(
                  'px-3 py-2.5 border-t transition-colors',
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 group-hover:bg-primary-50/40 dark:group-hover:bg-primary-900/10'
                )}>
                  <span className={cn(
                    'block text-xs font-semibold leading-snug line-clamp-2 min-h-[2.5em] transition-colors',
                    isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  )}>
                    {name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline preview panel */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="p-4">
              {loading ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ) : preview ? (
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <ImgWithFallback
                      src={preview.images.find(i => i.is_thumbnail)?.file_path ?? preview.images[0]?.file_path}
                      alt={lang === 'id' ? preview.name_id : preview.name_en}
                      fallback={PRODUCT_PLACEHOLDER}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {lang === 'id' ? preview.type.name_id : preview.type.name_en}
                      {' · '}
                      {lang === 'id' ? preview.category.name_id : preview.category.name_en}
                    </p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {lang === 'id' ? preview.name_id : preview.name_en}
                    </p>
                    {preview.attributes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {preview.attributes.slice(0, 3).map(a => (
                          <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                            {a.value}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={productPath(lang, preview)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {dict.catalog.product_card.view_details}
                    </Link>
                  </div>

                  {/* Close */}
                  <button
                    onClick={onClear}
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
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface ApiProductDetailViewProps {
  product: ProductDetail;
  relatedProducts: ProductListItem[];
  compatibility?: ProductCompatibility | null;
  /** The slug (or id, for a legacy deep link) actually present in the URL — used as the identifier for like/share calls per the slug-based SEO routing. */
  slug: string;
}

export default function ApiProductDetailView({ product, relatedProducts, compatibility, slug }: ApiProductDetailViewProps) {
  const { lang, dict } = useLang();
  const d = dict.catalog.product_detail;

  const [show3DPreview, setShow3DPreview] = useState(false);
  const [openDescription, setOpenDescription] = useState(true);
  const [openAttributes, setOpenAttributes] = useState(true);

  // Compatible product inline preview — grouped by role (cap / outer_pot / inner_pot),
  // each role independently selectable so a Cap, Outer Pot, and Inner Pot can all be
  // active simultaneously. Per-role scroll-drag state lives inside CompatRoleSection.
  const [selectedCompatId, setSelectedCompatId] = useState<Record<CompatRole, string | null>>(emptyByRole(null));
  const [compatPreview, setCompatPreview] = useState<Record<CompatRole, ProductDetail | null>>(emptyByRole(null));
  const [compatLoading, setCompatLoading] = useState<Record<CompatRole, boolean>>(emptyByRole(false));

  // Classify each compatible item by its own linked product's type — fetched
  // eagerly (metadata only, not the 3D file) so the scrollers can group
  // correctly before the customer picks anything. Falls back to 'cap' while
  // in flight, so nothing disappears/flashes empty during classification.
  const [idToRole, setIdToRole] = useState<Record<string, CompatRole>>({});
  // Thumbnail per compatible item, captured from the same eager detail fetch used
  // for role classification, so the scroller tiles show the real product image
  // instead of a generic placeholder icon.
  const [idToThumb, setIdToThumb] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    const items = compatibility?.compatible ?? [];
    if (items.length === 0) return;
    let cancelled = false;
    Promise.all(items.map((item) => getProductDetail(item.id))).then((details) => {
      if (cancelled) return;
      const map: Record<string, CompatRole> = {};
      const thumbs: Record<string, string | undefined> = {};
      items.forEach((item, i) => {
        const detail = details[i];
        map[item.id] = classifyByTypeName(detail?.type?.name_en);
        thumbs[item.id] = detail?.images.find(img => img.is_thumbnail)?.file_path ?? detail?.images[0]?.file_path;
      });
      setIdToRole(map);
      setIdToThumb(thumbs);
    });
    return () => { cancelled = true; };
  }, [compatibility]);

  const compatByRole = useMemo<Record<CompatRole, CompatibleProduct[]>>(() => {
    const groups: Record<CompatRole, CompatibleProduct[]> = { cap: [], outer_pot: [], inner_pot: [] };
    for (const item of compatibility?.compatible ?? []) {
      const role = idToRole[item.id] ?? 'cap';
      groups[role].push(item);
    }
    return groups;
  }, [compatibility, idToRole]);

  const selectedCompatItems = useMemo<Record<CompatRole, CompatibleProduct | null>>(() => {
    const result = {} as Record<CompatRole, CompatibleProduct | null>;
    for (const role of COMPAT_ROLES) {
      result[role] = compatByRole[role].find(c => c.id === selectedCompatId[role]) ?? null;
    }
    return result;
  }, [compatByRole, selectedCompatId]);

  const handleCompatClick = async (role: CompatRole, id: string) => {
    if (selectedCompatId[role] === id) {
      setSelectedCompatId(prev => ({ ...prev, [role]: null }));
      setCompatPreview(prev => ({ ...prev, [role]: null }));
      setCapPositionY(prev => ({ ...prev, [role]: 0 }));
      return;
    }
    setSelectedCompatId(prev => ({ ...prev, [role]: id }));
    setCompatLoading(prev => ({ ...prev, [role]: true }));
    setCompatPreview(prev => ({ ...prev, [role]: null }));
    // capPositionY is an OFFSET from the admin-configured midpoint, not an
    // absolute position — 0 here means "no offset", i.e. exactly the position
    // shown in the admin's own "Combined preview" (see layers construction
    // below, which adds this offset back on top of the midpoint).
    setCapPositionY(prev => ({ ...prev, [role]: 0 }));
    const detail = await getProductDetail(id);
    setCompatPreview(prev => ({ ...prev, [role]: detail }));
    setCompatLoading(prev => ({ ...prev, [role]: false }));
  };

  // Scale and horizontal alignment are admin-configured for this specific model
  // pairing (not a customer preference), so they're applied as fixed values from
  // the API response rather than exposed as sliders. Every role is computed the
  // same way, independently, off its own selected item.
  function deriveLayerBounds(item: CompatibleProduct | null) {
    // The midpoint (the default/"0" render position) must always match admin's
    // own Combined Preview formula exactly: a missing min/max is treated as 0,
    // not as an arbitrary fallback range — otherwise a compat item with no
    // configured range (or only one side configured) renders at a visibly
    // different default position than what the admin sees while configuring.
    const rawMin = typeof item?.min_position_vertical === 'number' ? item.min_position_vertical : 0;
    const rawMax = typeof item?.max_position_vertical === 'number' ? item.max_position_vertical : 0;
    const mid = (rawMin + rawMax) / 2;
    // Guard against a degenerate range (min === max, or min > max) collapsing
    // the slider to zero width — falls back to a small symmetric range around
    // that same midpoint, so the default position never shifts, only the
    // draggable width does.
    const valid = rawMin < rawMax;
    return {
      scale: item?.scale ?? 1,
      offsetX: item?.position?.x ?? 0,
      offsetZ: item?.position?.z ?? 0,
      min: valid ? rawMin : mid - 1,
      max: valid ? rawMax : mid + 1,
    };
  }
  const layerBoundsByRole = useMemo(() => {
    const result = {} as Record<CompatRole, ReturnType<typeof deriveLayerBounds>>;
    for (const role of COMPAT_ROLES) result[role] = deriveLayerBounds(selectedCompatItems[role]);
    return result;
  }, [selectedCompatItems]);

  // Color state for 3D viewer — the base product's own color stays scalar (it's
  // not a role); each attached role gets its own independent color state.
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isCustomColor, setIsCustomColor] = useState(true);
  const [selectedColorName, setSelectedColorName] = useState('');
  const [capColor, setCapColor] = useState<Record<CompatRole, string>>(emptyByRole('#ffffff'));
  const [isCustomCapColor, setIsCustomCapColor] = useState<Record<CompatRole, boolean>>(emptyByRole(true));
  const [selectedCapColorName, setSelectedCapColorName] = useState<Record<CompatRole, string>>(emptyByRole(''));
  // Suspends orbit drag while a color picker (now rendered below the canvas) is open
  const [anyPickerOpen, setAnyPickerOpen] = useState(false);

  const handleColorPresetSelect = (name: string) => {
    setSelectedColorName(name);
    setCustomColor(colorToHex[name] ?? '#ffffff');
  };
  const handleCapColorPresetSelect = (role: CompatRole, name: string) => {
    setSelectedCapColorName(prev => ({ ...prev, [role]: name }));
    setCapColor(prev => ({ ...prev, [role]: colorToHex[name] ?? '#ffffff' }));
  };

  // Per-role vertical position slider (customer-adjustable, bounded by admin-configured range)
  const [capPositionY, setCapPositionY] = useState<Record<CompatRole, number>>(emptyByRole(0));

  // Cascading stacking constraint: a lower layer may never be raised past the
  // active layer directly above it — inner ≤ outer ≤ cap. COMPAT_ROLES is ordered
  // top→bottom, so we walk it top-down: each role's absolute position is capped
  // at the nearest active role above it, and that clamped position becomes the
  // ceiling for the next one down. `effectiveOffset` is the actual offset used
  // for rendering/readout (raw slider value clamped to that ceiling), so if the
  // layer above moves down the layers below auto-follow without overlapping.
  const { maxOffsetByRole, effectiveOffsetByRole } = useMemo(() => {
    const maxOffset = {} as Record<CompatRole, number>;
    const effective = {} as Record<CompatRole, number>;
    let ceiling = Infinity; // absolute position the current role may not exceed
    for (const role of COMPAT_ROLES) {
      const b = layerBoundsByRole[role];
      const mid = (b.min + b.max) / 2;
      // Fixed upward travel in real 3D units: an unconstrained (top) layer can be
      // raised 0 → POSITION_MAX. Lower layers are then further limited so their
      // absolute position never passes the layer stacked above them.
      const max = ceiling === Infinity ? POSITION_MAX : Math.max(0, Math.min(POSITION_MAX, ceiling - mid));
      maxOffset[role] = max;
      const eff = Math.min(Math.max(0, capPositionY[role]), max);
      effective[role] = eff;
      // Only an actually-selected layer lowers the ceiling for those beneath it.
      if (selectedCompatItems[role]) ceiling = mid + eff;
    }
    return { maxOffsetByRole: maxOffset, effectiveOffsetByRole: effective };
  }, [layerBoundsByRole, capPositionY, selectedCompatItems]);

  const productFamily = classifyFamily(product.type.name_en, product.type.name_id);
  const isBottle = productFamily === 'bottle';
  const categoryPath = familyToSlug(productFamily);
  const categoryName = lang === 'id' ? product.type.name_id : product.type.name_en;
  const productName = lang === 'id' ? product.name_id : product.name_en;
  const pc = dict.catalog.product_card;

  // Like, share & compare — must be after productName is defined
  const { liked, likeCount, toggle: toggleLike } = useLike(slug, product.like_count);
  const { share, copied } = useShare(slug, productName);
  const { toggle: toggleCompare, has: hasCompare, canAdd } = useCompare();
  const isComparing = hasCompare(product.id);
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const handleCompare = () => {
    // Snapshot the current configuration (base colour + each attached part with
    // its resolved 3D layer) so the Compare page can reproduce the combination.
    // Mirrors the Product3DViewer `layers` construction used in the preview.
    const config: CompareConfig = {
      baseColor: customColor,
      baseColorName: isCustomColor ? '' : (selectedColorName || ''),
      layers: COMPAT_ROLES.flatMap((role) => {
        const compatItem = selectedCompatItems[role];
        if (!compatItem) return [];
        const preview = compatPreview[role];
        const bounds = layerBoundsByRole[role];
        const mid = (bounds.min + bounds.max) / 2;
        return [{
          role,
          name_en: compatItem.name_en,
          name_id: compatItem.name_id,
          url: validGlbUrl(preview?.three_d_file_path || compatItem.three_d_file_path),
          color: capColor[role],
          colorName: isCustomCapColor[role] ? '' : (selectedCapColorName[role] || ''),
          scale: bounds.scale,
          positionX: bounds.offsetX,
          positionY: mid + effectiveOffsetByRole[role],
          positionZ: bounds.offsetZ,
        }];
      }),
    };
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.images.find(i => i.is_thumbnail)?.file_path ?? product.images[0]?.file_path,
      three_d_file_path: product.three_d_file_path,
      config,
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

  // WhatsApp inquiry — composes a message with the base bottle plus any selected
  // cap / outer / inner and each item's chosen color (preset name or custom hex).
  const WHATSAPP_NUMBER = '622112345678';
  const colorLabel = (isCustom: boolean, name: string, hex: string) =>
    isCustom ? hex.toUpperCase() : (name || (lang === 'id' ? 'Bawaan' : 'Default'));
  const buildQuoteMessage = () => {
    const colorWord = lang === 'id' ? 'Warna' : 'Color';
    const lines = [
      lang === 'id' ? 'Halo, saya tertarik dengan produk berikut:' : "Hi, I'm interested in the following product:",
      '',
      `*${lang === 'id' ? 'Botol' : 'Bottle'}:* ${productName}`,
      `${colorWord}: ${colorLabel(isCustomColor, selectedColorName, customColor)}`,
    ];
    for (const role of COMPAT_ROLES) {
      const item = selectedCompatItems[role];
      if (!item) continue;
      lines.push(
        '',
        `*${ROLE_LABELS[role][lang]}:* ${lang === 'id' ? item.name_id : item.name_en}`,
        `${colorWord}: ${colorLabel(isCustomCapColor[role], selectedCapColorName[role], capColor[role])}`,
      );
    }
    return lines.join('\n');
  };
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteMessage())}`;

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

          {/* ══ LEFT: Gallery / 3D (sticky — follows the taller right column while scrolling) ══ */}
          <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:sticky lg:top-28 lg:self-start">
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
                  {/* ── Single canvas: base product + all active layers together ── */}
                  <Viewer3DErrorBoundary>
                    <Product3DViewer
                      bottleModelUrl={validGlbUrl(product.three_d_file_path)}
                      bottleColor={customColor}
                      bottleScale={1}
                      layers={COMPAT_ROLES.flatMap((role) => {
                        const item = selectedCompatItems[role];
                        if (!item) return [];
                        const preview = compatPreview[role];
                        const bounds = layerBoundsByRole[role];
                        const mid = (bounds.min + bounds.max) / 2;
                        return [{
                          key: role,
                          url: validGlbUrl(preview?.three_d_file_path || item.three_d_file_path),
                          color: capColor[role],
                          scale: bounds.scale,
                          positionY: mid + effectiveOffsetByRole[role],
                          positionX: bounds.offsetX,
                          positionZ: bounds.offsetZ,
                        }];
                      })}
                      orbitEnabled={!anyPickerOpen}
                    />
                  </Viewer3DErrorBoundary>

                  {/* ── Color pickers — kept below the canvas so it doesn't crowd the 3D view ── */}
                  <div className={cn('flex flex-wrap gap-2', COMPAT_ROLES.some((r) => selectedCompatItems[r]) ? 'justify-between' : 'justify-start')}>
                    <ColorSwatchPanel
                      config={{
                        colors: PRODUCT_COLORS,
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
                    {COMPAT_ROLES.filter((role) => selectedCompatItems[role]).map((role) => (
                      <ColorSwatchPanel
                        key={role}
                        config={{
                          colors: PRODUCT_COLORS,
                          selectedColor: selectedCapColorName[role],
                          onColorChange: (name) => handleCapColorPresetSelect(role, name),
                          customColor: capColor[role],
                          onCustomColorChange: (hex) => setCapColor((prev) => ({ ...prev, [role]: hex })),
                          isCustom: isCustomCapColor[role],
                          onIsCustomChange: (v) => setIsCustomCapColor((prev) => ({ ...prev, [role]: v })),
                          label: `${ROLE_LABELS[role][lang]} ${lang === 'id' ? 'Warna' : 'Color'}`,
                        }}
                        onOpenChange={setAnyPickerOpen}
                      />
                    ))}
                  </div>

                  {/* ── Position sliders (one per active role) ── */}
                  {COMPAT_ROLES.filter((role) => selectedCompatItems[role]).map((role) => {
                    // Slider goes 0 → max: the customer can raise the part but never lower
                    // it below the admin's reference position, and never above the active
                    // layer stacked over it (inner ≤ outer ≤ cap).
                    const max = maxOffsetByRole[role];
                    const value = effectiveOffsetByRole[role];
                    return (
                      <div key={role} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          {lang === 'id' ? `Sesuaikan ${ROLE_LABELS[role].id}` : `Adjust ${ROLE_LABELS[role].en}`}
                        </p>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-white">
                              {lang === 'id' ? 'Posisi' : 'Position'}
                            </label>
                            <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded">
                              {value.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={max}
                            step={0.01}
                            value={value}
                            disabled={max <= 0}
                            onChange={(e) => setCapPositionY((prev) => ({ ...prev, [role]: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle 2D / 3D — only show if 3D file exists */}
            {product.three_d_file_path && (
              show3DPreview ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShow3DPreview(false)}
                  className="group mt-4 w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                  {d.view_gallery}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShow3DPreview(true)}
                  className="group relative mt-4 w-full overflow-hidden rounded-2xl py-4 px-5 shadow-lg shadow-primary-500/25 transition-shadow hover:shadow-xl hover:shadow-primary-500/35"
                >
                  {/* Gradient fill */}
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-[length:200%_100%] group-hover:bg-[position:100%_0] transition-[background-position] duration-700" />
                  {/* Shine sweep on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2.5 text-sm font-bold text-white">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                      <Box className="w-4 h-4" />
                    </span>
                    {d.view_3d_preview}
                    {(() => {
                      const activeRoles = COMPAT_ROLES.filter((role) => selectedCompatItems[role]);
                      if (activeRoles.length === 0) return null;
                      if (activeRoles.length === 1) {
                        const item = selectedCompatItems[activeRoles[0]]!;
                        return (
                          <span className="ml-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 ring-1 ring-white/30 text-white">
                            + {lang === 'id' ? item.name_id : item.name_en}
                          </span>
                        );
                      }
                      return (
                        <span className="ml-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 ring-1 ring-white/30 text-white">
                          + {activeRoles.length}
                        </span>
                      );
                    })()}
                  </span>
                </motion.button>
              )
            )}
          </div>

          {/* ══ RIGHT: Product info ══ */}
          <div className="space-y-5 min-w-0">

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
                    {likeCount > 0 && <span className="text-xs font-mono opacity-70">{likeCount}</span>}
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

            {/* ── Compatible Products — one section per role, each independently selectable ── */}
            {compatibility && COMPAT_ROLES.some((role) => compatByRole[role].length > 0) && (
              <div className="space-y-4">
                {COMPAT_ROLES.filter((role) => compatByRole[role].length > 0).map((role) => (
                  <CompatRoleSection
                    key={role}
                    role={role}
                    items={compatByRole[role]}
                    thumbs={idToThumb}
                    selectedId={selectedCompatId[role]}
                    preview={compatPreview[role]}
                    loading={compatLoading[role]}
                    onSelect={(id) => handleCompatClick(role, id)}
                    onClear={() => {
                      setSelectedCompatId((prev) => ({ ...prev, [role]: null }));
                      setCompatPreview((prev) => ({ ...prev, [role]: null }));
                    }}
                  />
                ))}
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

              {/* Inquiry button — opens WhatsApp with the selected configuration */}
              <motion.a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
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
                href={`/${lang}/${categoryPath}`}
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
              href={`/${lang}/${categoryPath}`}
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
