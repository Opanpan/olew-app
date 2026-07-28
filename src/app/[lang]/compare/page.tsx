'use client';

import { useEffect, useState, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, X, Package, ChevronRight, ArrowLeftRight, Box, Image as ImageIcon, Minus,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import { getProductDetail, type ProductDetail } from '@/lib/publicApi';
import { productPath } from '@/lib/seo';
import ImgWithFallback from '@/components/shared/ImgWithFallback';
import { cn, validGlbUrl } from '@/lib/utils';
import type { CompareConfig } from '@/lib/CompareContext';

const Product3DViewer = dynamic(
  () => import('@/components/catalog/detail/Product3DViewer'),
  { ssr: false, loading: () => <div className="w-full aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" /> }
);

// ── helpers ───────────────────────────────────────────────────────────────────

function isDiff(vals: unknown[]) {
  return new Set(vals.map(String)).size > 1;
}

// Responsive grid template shared by the header row and every spec row: a
// narrower sticky label column on mobile, wider on desktop, plus one equal
// column per product.
function gridColsClass(colCount: 2 | 3 | 4) {
  return cn(
    'grid',
    colCount === 2 && 'grid-cols-[104px_1fr_1fr] md:grid-cols-[180px_1fr_1fr]',
    colCount === 3 && 'grid-cols-[104px_repeat(3,1fr)] md:grid-cols-[180px_repeat(3,1fr)]',
    colCount === 4 && 'grid-cols-[104px_repeat(4,1fr)] md:grid-cols-[180px_repeat(4,1fr)]',
  );
}

interface SpecRowProps {
  label: string;
  values: React.ReactNode[];
  rowIndex: number;
  highlight: boolean;
  colCount: 2 | 3 | 4;
}

function SpecRow({ label, values, rowIndex, highlight, colCount }: SpecRowProps) {
  const stripe = rowIndex % 2 === 0;
  return (
    <div className={cn(
      gridColsClass(colCount),
      stripe ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/70 dark:bg-gray-800/40',
    )}>
      <div className={cn(
        'sticky left-0 z-10 flex items-center px-3 md:px-4 py-3.5 border-r border-gray-100 dark:border-gray-800 border-l-2',
        // opaque bg so scrolled product cells don't show through the sticky label
        stripe ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800',
        highlight ? 'border-l-amber-400' : 'border-l-transparent'
      )}>
        <span className="text-[11px] md:text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      {values.map((val, i) => (
        <div key={i} className={cn(
          'px-3 md:px-4 py-3.5 flex items-center text-[13px] md:text-sm font-medium text-gray-900 dark:text-white',
          i < values.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
          highlight && 'bg-amber-50/60 dark:bg-amber-900/10'
        )}>
          {val ?? <Minus className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
        </div>
      ))}
    </div>
  );
}

// Swatch + colour name (or hex) used inside the Configuration spec rows.
function ColorValue({ hex, name }: { hex: string; name?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/15"
        style={{ backgroundColor: hex }}
      />
      <span>{name || hex.toUpperCase()}</span>
    </span>
  );
}

// A single "part • colour" line inside a compared product's header card.
function ConfigChip({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/15"
        style={{ backgroundColor: swatch }}
      />
      <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">{label}</span>
      <span className="ml-auto text-[10px] font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{value}</span>
    </div>
  );
}

function SectionDivider({ title, colCount }: { title: string; colCount: 2 | 3 | 4 }) {
  return (
    <div className={gridColsClass(colCount)}>
      <div className="col-span-full sticky left-0 px-3 md:px-4 py-2.5 bg-gradient-to-r from-primary-600/10 to-sky-500/5 dark:from-primary-900/40 dark:to-sky-900/20 border-t border-b border-primary-100 dark:border-primary-900/50">
        <span className="text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">{title}</span>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function CompareContent() {
  const searchParams = useSearchParams();
  const { lang, dict } = useLang();
  const { list, remove, clear } = useCompare();
  const c = dict.catalog.compare;

  // Config (base colour + attached parts) snapshotted when the product was added
  // from the detail configurator; keyed by product id in the persisted list.
  const configFor = (id: string): CompareConfig | undefined => list.find(i => i.id === id)?.config;
  const roleLabel = (role: string): string =>
    role === 'outer_pot' ? c.role_outer_pot : role === 'inner_pot' ? c.role_inner_pot : c.role_cap;

  const rawIds = searchParams.get('ids') ?? '';
  const ids = rawIds.split(',').filter(Boolean);

  const [products, setProducts] = useState<(ProductDetail | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [localIds, setLocalIds] = useState<string[]>(ids);

  useEffect(() => {
    if (localIds.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(localIds.map(id => getProductDetail(id))).then(results => {
      setProducts(results);
      setLoading(false);
    });
  }, [localIds]);

  const removeProduct = (id: string) => {
    setLocalIds(prev => prev.filter(x => x !== id));
    setProducts(prev => prev.filter(p => p?.id !== id));
    remove(id);
  };

  const validProducts = products.filter((p): p is ProductDetail => p !== null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (validProducts.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <ArrowLeftRight className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{c.empty_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{c.empty_desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${lang}/products/bottles`} className="btn-primary px-6 py-3">{dict.nav.bottles}</Link>
            <Link href={`/${lang}/products/caps`} className="btn-outline px-6 py-3">{dict.nav.caps}</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const colCount = Math.min(validProducts.length, 4) as 2 | 3 | 4;

  // Collect all attribute keys across compared products
  const allAttrKeys = Array.from(
    new Set(validProducts.flatMap(p => p.attributes.map(a => a.key)))
  ).sort();

  // Per-product saved configuration, and the union of roles selected across them,
  // so the Configuration section only appears when someone configured a combo.
  const productConfigs = validProducts.map(p => configFor(p.id));
  const anyConfig = productConfigs.some(cfg => !!cfg);
  const roleUnion = (['cap', 'outer_pot', 'inner_pot'] as const).filter(role =>
    productConfigs.some(cfg => cfg?.layers.some(l => l.role === role))
  );

  let rowIdx = 0;

  const productName = (p: ProductDetail) => lang === 'id' ? p.name_id : p.name_en;
  const typeName = (p: ProductDetail) => lang === 'id' ? p.type.name_id : p.type.name_en;
  const catName = (p: ProductDetail) => lang === 'id' ? p.category.name_id : p.category.name_en;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero — themed background banner (light / dark) */}
      <div className="relative overflow-hidden bg-primary-700 dark:bg-gray-950 pt-20 md:pt-24 pb-8 md:pb-10">
        <Image
          src="/images/banners/compare-hero-light.jpg"
          alt=""
          fill
          priority
          className="object-cover dark:hidden"
        />
        <Image
          src="/images/banners/compare-hero-dark.jpg"
          alt=""
          fill
          priority
          className="object-cover hidden dark:block"
        />
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 pointer-events-none" />
        <div className="relative container-custom mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">{dict.nav.home}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{c.page_title}</span>
          </nav>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-2">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {c.x_products.replace('{count}', String(validProducts.length))}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">{c.page_title}</h1>
              <p className="text-white/70 text-xs md:text-sm">{c.page_subtitle}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShow3D(v => !v)}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs md:text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {show3D ? <><ImageIcon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{c.view_2d}</span></>
                         : <><Box className="w-3.5 h-3.5" /><span className="hidden sm:inline">{c.view_3d}</span></>}
              </button>
              <Link href={`/${lang}/products/bottles`} className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs md:text-sm font-medium hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{c.back}</span>
              </Link>
              <button onClick={() => { clear(); setLocalIds([]); setProducts([]); }}
                className="px-3 md:px-4 py-2 rounded-xl bg-red-500/20 border border-red-300/30 text-red-100 text-xs md:text-sm font-medium hover:bg-red-500/30 transition-colors">
                {c.clear_all}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="container-custom mx-auto px-3 sm:px-4 py-6 md:py-8">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 overflow-x-auto">
          <div className={cn(
            colCount === 2 && 'min-w-[440px]',
            colCount === 3 && 'min-w-[620px]',
            colCount === 4 && 'min-w-[820px]',
          )}>

            {/* Product header row */}
            <div className={cn(
              'sticky top-16 z-30 border-b border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-t-2xl',
              gridColsClass(colCount),
            )}>
              <div className="sticky left-0 z-10 flex items-end px-3 md:px-4 pb-4 pt-6 border-r border-gray-100 dark:border-gray-800 rounded-tl-2xl bg-gradient-to-b from-gray-50/95 to-white dark:from-gray-800/90 dark:to-gray-900">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{c.specs_label}</span>
              </div>
              {validProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'relative flex flex-col gap-2.5 p-3 md:p-4',
                    i < validProducts.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
                    i === validProducts.length - 1 && 'rounded-tr-2xl',
                  )}
                >
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Large image or 3D preview */}
                  <div className={cn(
                    'relative w-full max-w-[260px] mx-auto aspect-square rounded-2xl overflow-hidden flex items-center justify-center',
                    // keep the soft backdrop for flat images, but not behind the 3D canvas
                    show3D && validGlbUrl(product.three_d_file_path)
                      ? ''
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-200/70 dark:ring-gray-700/50'
                  )}>
                    {show3D && validGlbUrl(product.three_d_file_path) ? (
                      <Product3DViewer
                        bottleModelUrl={validGlbUrl(product.three_d_file_path)}
                        bottleColor={configFor(product.id)?.baseColor ?? '#d1d5db'}
                        layers={(configFor(product.id)?.layers ?? []).map(l => ({
                          key: l.role,
                          url: l.url,
                          color: l.color,
                          scale: l.scale,
                          positionX: l.positionX,
                          positionY: l.positionY,
                          positionZ: l.positionZ,
                        }))}
                        compact
                      />
                    ) : product.images[0] ? (
                      <ImgWithFallback
                        src={product.images.find(img => img.is_thumbnail)?.file_path ?? product.images[0].file_path}
                        alt={productName(product)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                      {typeName(product)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {catName(product)}
                    </span>
                  </div>

                  <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {productName(product)}
                  </p>

                  {/* Configured combination — bottle + attached parts with their colours */}
                  {(() => {
                    const cfg = configFor(product.id);
                    if (!cfg || cfg.layers.length === 0) return null;
                    return (
                      <div className="flex flex-col gap-1 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-2">
                        <ConfigChip
                          swatch={cfg.baseColor}
                          label={c.bottle}
                          value={cfg.baseColorName || cfg.baseColor.toUpperCase()}
                        />
                        {cfg.layers.map(l => (
                          <ConfigChip
                            key={l.role}
                            swatch={l.color}
                            label={`${roleLabel(l.role)}: ${lang === 'id' ? l.name_id : l.name_en}`}
                            value={l.colorName || l.color.toUpperCase()}
                          />
                        ))}
                      </div>
                    );
                  })()}

                  <Link
                    href={productPath(lang, product)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-auto"
                  >
                    {c.view_details} <ChevronRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Basic info rows */}
            <SectionDivider title={c.spec_basic} colCount={colCount} />
            <SpecRow
              label={c.type}
              rowIndex={rowIdx++}
              highlight={isDiff(validProducts.map(p => p.type.id))}
              colCount={colCount}
              values={validProducts.map(p => <span key={p.id}>{typeName(p)}</span>)}
            />
            <SpecRow
              label="Category"
              rowIndex={rowIdx++}
              highlight={isDiff(validProducts.map(p => p.category.id))}
              colCount={colCount}
              values={validProducts.map(p => <span key={p.id}>{catName(p)}</span>)}
            />

            {/* Attribute rows */}
            {allAttrKeys.length > 0 && (
              <SectionDivider title={c.spec_dimensions} colCount={colCount} />
            )}
            {allAttrKeys.map((key) => {
              const vals = validProducts.map(p => {
                const attr = p.attributes.find(a => a.key === key);
                return attr ? attr.value : null;
              });
              const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return (
                <SpecRow
                  key={key}
                  label={label}
                  rowIndex={rowIdx++}
                  highlight={isDiff(vals)}
                  colCount={colCount}
                  values={vals.map((v, i) => v
                    ? <span key={i} className="font-semibold">{v}</span>
                    : <Minus key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  )}
                />
              );
            })}

            {/* Configuration rows — selected parts + colours from the saved combo */}
            {anyConfig && (
              <>
                <SectionDivider title={c.spec_configuration} colCount={colCount} />
                <SpecRow
                  label={c.bottle_color}
                  rowIndex={rowIdx++}
                  highlight={isDiff(productConfigs.map(cfg => cfg ? (cfg.baseColorName || cfg.baseColor) : '—'))}
                  colCount={colCount}
                  values={productConfigs.map((cfg, i) => cfg
                    ? <ColorValue key={i} hex={cfg.baseColor} name={cfg.baseColorName} />
                    : null)}
                />
                {roleUnion.map(role => {
                  const parts = productConfigs.map(cfg => cfg?.layers.find(l => l.role === role));
                  return (
                    <Fragment key={role}>
                      <SpecRow
                        label={c.selected_fmt.replace('{role}', roleLabel(role))}
                        rowIndex={rowIdx++}
                        highlight={isDiff(parts.map(l => l ? (lang === 'id' ? l.name_id : l.name_en) : '—'))}
                        colCount={colCount}
                        values={parts.map((l, i) => l
                          ? <span key={i} className="font-semibold">{lang === 'id' ? l.name_id : l.name_en}</span>
                          : null)}
                      />
                      <SpecRow
                        label={c.color_fmt.replace('{role}', roleLabel(role))}
                        rowIndex={rowIdx++}
                        highlight={isDiff(parts.map(l => l ? (l.colorName || l.color) : '—'))}
                        colCount={colCount}
                        values={parts.map((l, i) => l
                          ? <ColorValue key={i} hex={l.color} name={l.colorName} />
                          : null)}
                      />
                    </Fragment>
                  );
                })}
              </>
            )}

            {/* Description rows */}
            {validProducts.some(p => p.description) && (
              <>
                <SectionDivider title={c.spec_features} colCount={colCount} />
                <SpecRow
                  label="Description"
                  rowIndex={rowIdx++}
                  highlight={false}
                  colCount={colCount}
                  values={validProducts.map(p => {
                    const desc = p.description ? (lang === 'id' ? p.description.short_id : p.description.short_en) : null;
                    return desc ? <span key={p.id} className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{desc}</span> : null;
                  })}
                />
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded border-l-2 border-amber-400 bg-amber-50/80" />
            <span>{c.legend_diff}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return <Suspense><CompareContent /></Suspense>;
}
