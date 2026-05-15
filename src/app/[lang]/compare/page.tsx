'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, X, Droplet, Package, Award, Sparkles, ChevronRight,
  Ruler, Weight, Layers, Tag, Hash, Palette, Check, Minus,
  TrendingUp, TrendingDown, ArrowLeftRight,
} from 'lucide-react';
import Link from 'next/link';
import { bottlesData, capsData } from '@/data/products';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import { colorToHex } from '@/components/catalog/detail/EnhancedColorPicker';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

const allProducts: Product[] = [...bottlesData, ...capsData];

// ── numeric bar ───────────────────────────────────────────────────────────────

function NumericBar({ value, max, isMin, isMax }: {
  value: number; max: number; isMin: boolean; isMax: boolean;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isMax ? 'bg-emerald-500' : isMin ? 'bg-primary-400' : 'bg-gray-300 dark:bg-gray-500'
          )}
        />
      </div>
      <span className={cn(
        'text-[9px] font-bold w-5 text-right flex-shrink-0',
        isMax ? 'text-emerald-600 dark:text-emerald-400'
          : isMin ? 'text-primary-500' : 'text-gray-400'
      )}>
        {pct}%
      </span>
    </div>
  );
}

// ── desktop-only spec row ─────────────────────────────────────────────────────

interface SpecRowProps {
  label: string;
  icon: React.ReactNode;
  values: React.ReactNode[];
  rowIndex: number;
  isDiff: boolean;
  colCount: 2 | 3 | 4;
}

function SpecRow({ label, icon, values, rowIndex, isDiff, colCount }: SpecRowProps) {
  const evenRow = rowIndex % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rowIndex * 0.04 }}
      className={cn(
        'hidden md:grid',
        evenRow ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/70 dark:bg-gray-800/40',
        colCount === 2 && 'grid-cols-[160px_1fr_1fr]',
        colCount === 3 && 'grid-cols-[160px_1fr_1fr_1fr]',
        colCount === 4 && 'grid-cols-[160px_1fr_1fr_1fr_1fr]',
      )}
    >
      <div className={cn(
        'flex items-center gap-2 px-4 py-3.5 border-r border-gray-100 dark:border-gray-800',
        isDiff ? 'border-l-2 border-l-amber-400' : 'border-l-2 border-l-transparent'
      )}>
        <span className="text-primary-500 dark:text-primary-400 flex-shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-tight">{label}</span>
      </div>
      {values.map((val, i) => (
        <div key={i} className={cn(
          'px-4 py-3.5 flex flex-col justify-center',
          i < values.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
          isDiff && 'bg-amber-50/60 dark:bg-amber-900/10'
        )}>
          {val}
        </div>
      ))}
    </motion.div>
  );
}

// ── desktop-only section divider ──────────────────────────────────────────────

function SectionHeader({ title, colCount }: { title: string; colCount: 2 | 3 | 4 }) {
  return (
    <div className={cn(
      'hidden md:grid',
      colCount === 2 && 'grid-cols-[160px_1fr_1fr]',
      colCount === 3 && 'grid-cols-[160px_1fr_1fr_1fr]',
      colCount === 4 && 'grid-cols-[160px_1fr_1fr_1fr_1fr]',
    )}>
      <div className="col-span-full px-4 py-2.5 bg-gradient-to-r from-primary-600/10 to-sky-500/5 dark:from-primary-900/40 dark:to-sky-900/20 border-t border-b border-primary-100 dark:border-primary-900/50">
        <span className="text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">{title}</span>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { lang, dict } = useLang();
  const { remove, clear } = useCompare();
  const c = dict.catalog.compare;

  const rawIds = searchParams.get('ids') || '';
  const [localIds, setLocalIds] = useState<string[]>(rawIds.split(',').filter(Boolean));

  const products = useMemo(
    () => localIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as Product[],
    [localIds]
  );

  const removeProduct = (id: string) => {
    setLocalIds(prev => prev.filter(x => x !== id));
    remove(id);
  };

  if (products.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <ArrowLeftRight className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{c.empty_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{c.empty_desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${lang}/bottles`} className="btn-primary px-6 py-3">{dict.nav.bottles}</Link>
            <Link href={`/${lang}/caps`} className="btn-outline px-6 py-3">{dict.nav.caps}</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const colCount = Math.min(products.length, 4) as 2 | 3 | 4;

  const weights    = products.map(p => p.dimensions.weight);
  const heights    = products.map(p => p.dimensions.height);
  const capacities = products.map(p => p.dimensions.capacity ?? 0);

  const maxWeight   = Math.max(...weights);
  const minWeight   = Math.min(...weights);
  const maxHeight   = Math.max(...heights);
  const maxCapacity = Math.max(...capacities);
  const minCapacity = Math.min(...capacities.filter(v => v > 0));

  const isDiff = (vals: unknown[]) => new Set(vals.map(String)).size > 1;

  const renderBool = (val: boolean | undefined) => (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      val ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
          : 'text-gray-300 dark:text-gray-600'
    )}>
      {val ? <><Check className="w-3 h-3" />{c.yes}</> : <Minus className="w-3 h-3" />}
    </span>
  );

  let rowIdx = 0;

  // ── shared product card content ────────────────────────────────────────────
  const productCardContent = (product: Product, i: number, mobileMode = false) => {
    const Icon = product.category === 'bottle' ? Droplet : Package;
    const detailUrl = `/${lang}/${product.category === 'bottle' ? 'bottles' : 'caps'}/${product.id}`;
    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08 }}
        className={cn(
          'relative flex flex-col gap-1.5',
          mobileMode ? 'p-2' : cn(
            'px-3 py-4',
            i < products.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
            i === products.length - 1 && 'rounded-tr-2xl',
            i === 0 && 'bg-gradient-to-b from-primary-50/60 to-white dark:from-primary-900/20 dark:to-gray-900'
          )
        )}
      >
        <button
          onClick={() => removeProduct(product.id)}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-400 transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>

        <div className={cn(
          'rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center flex-shrink-0',
          mobileMode ? 'w-full h-16' : 'w-full h-24'
        )}>
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <Icon className={cn('text-gray-300 dark:text-gray-600', mobileMode ? 'w-7 h-7' : 'w-10 h-10')} />
          )}
        </div>

        <span className={cn(
          'self-start inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold text-[9px]',
          product.category === 'bottle'
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
        )}>
          {product.category === 'bottle' ? <Droplet className="w-2 h-2" /> : <Package className="w-2 h-2" />}
          {product.category === 'bottle' ? c.bottle : c.cap}
        </span>

        <p className={cn('font-bold text-gray-900 dark:text-white leading-tight', mobileMode ? 'text-[11px] line-clamp-3' : 'text-sm line-clamp-2')}>
          {product.name}
        </p>
        {!mobileMode && <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.type}</p>}

        <div className="flex flex-wrap gap-1">
          {product.featured && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
              <Award className="w-2 h-2" />Featured
            </span>
          )}
          {product.bestSeller && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[9px] font-bold">
              Best Seller
            </span>
          )}
          {product.newArrival && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
              <Sparkles className="w-2 h-2" />New
            </span>
          )}
        </div>

        {!mobileMode && (
          <Link href={detailUrl} className="mt-auto flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            {c.view_details} <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </motion.div>
    );
  };

  // ── mobile grid helpers ────────────────────────────────────────────────────
  // Label column: 80px sticky. Product columns: 130px each (fixed, not fr).
  // Total min-width ensures overflow-x-auto kicks in on narrow screens.
  const mobileHeaderGridCls = cn(
    'grid',
    colCount === 2 && 'grid-cols-[80px_130px_130px]',
    colCount === 3 && 'grid-cols-[80px_130px_130px_130px]',
    colCount === 4 && 'grid-cols-[80px_130px_130px_130px_130px]',
  );
  const mobileMinW = cn(
    colCount === 2 && 'min-w-[340px]',
    colCount === 3 && 'min-w-[470px]',
    colCount === 4 && 'min-w-[600px]',
  );

  let mobileRowIdx = 0;

  const renderMobileSection = (title: string) => (
    <div className={mobileHeaderGridCls}>
      <div className="col-span-full px-3 py-2 bg-gradient-to-r from-primary-600/10 to-sky-500/5 dark:from-primary-900/40 dark:to-sky-900/20 border-t border-b border-primary-100 dark:border-primary-900/50">
        <span className="text-[9px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">{title}</span>
      </div>
    </div>
  );

  const renderMobileRow = (label: string, icon: React.ReactNode, values: React.ReactNode[], diff: boolean) => {
    const idx = mobileRowIdx++;
    const even = idx % 2 === 0;
    const rowBg = even ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
    const labelBg = even ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
    return (
      <div className={cn(mobileHeaderGridCls, rowBg, diff && 'border-l-2 border-l-amber-400')}>
        {/* sticky label column */}
        <div className={cn(
          'sticky left-0 z-10 flex flex-col justify-center gap-0.5 px-2 py-2.5 border-r border-gray-100 dark:border-gray-800',
          labelBg,
        )}>
          <span className="text-primary-500 dark:text-primary-400 flex-shrink-0">{icon}</span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight">{label}</span>
          {diff && (
            <span className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded-full w-fit">diff</span>
          )}
        </div>
        {values.map((val, i) => (
          <div key={i} className={cn(
            'px-2 py-2.5 flex flex-col justify-center text-xs min-w-0',
            i < values.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
            diff && 'bg-amber-50/50 dark:bg-amber-900/5'
          )}>
            {val}
          </div>
        ))}
      </div>
    );
  };

  // ── precompute spec values (shared by mobile + desktop rows) ───────────────
  const productIdVals = products.map(p =>
    <span key={p.id} className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 break-all">{p.id}</span>
  );
  const typeVals = products.map(p =>
    <span key={p.id} className="text-xs font-medium text-gray-800 dark:text-gray-200">{p.type}</span>
  );
  const categoryVals = products.map(p => (
    <span key={p.id} className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold',
      p.category === 'bottle'
        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    )}>
      {p.category === 'bottle' ? <Droplet className="w-3 h-3" /> : <Package className="w-3 h-3" />}
      {p.category === 'bottle' ? c.bottle : c.cap}
    </span>
  ));
  const weightVals = products.map(p => {
    const w = p.dimensions.weight;
    const isMin = w === minWeight && products.length > 1;
    const isMax = w === maxWeight && products.length > 1;
    return (
      <div key={p.id}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-sm font-black text-gray-900 dark:text-white">{w}g</span>
          {isMin && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary-600 dark:text-primary-400"><TrendingDown className="w-3 h-3" />{c.lighter}</span>}
          {isMax && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-500"><TrendingUp className="w-3 h-3" />{c.heavier}</span>}
        </div>
        <NumericBar value={w} max={maxWeight} isMin={isMin} isMax={isMax} />
      </div>
    );
  });
  const dimensionVals = products.map(p => {
    const isMax = p.dimensions.height === maxHeight && products.length > 1;
    return (
      <div key={p.id}>
        <span className="text-sm font-black text-gray-900 dark:text-white">
          {p.dimensions.width}<span className="text-[10px] font-normal text-gray-400">mm</span>
          <span className="text-gray-400 mx-0.5">×</span>
          {p.dimensions.height}<span className="text-[10px] font-normal text-gray-400">mm</span>
        </span>
        <NumericBar value={p.dimensions.height} max={maxHeight} isMin={false} isMax={isMax} />
      </div>
    );
  });
  const capacityVals = products.map(p => {
    const cap = p.dimensions.capacity;
    if (!cap) return <span key={p.id} className="text-xs text-gray-400 italic">{c.not_applicable}</span>;
    const isMax = cap === maxCapacity && products.length > 1;
    const isMin = cap === minCapacity && minCapacity !== maxCapacity && products.length > 1;
    return (
      <div key={p.id}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-sm font-black text-gray-900 dark:text-white">{cap}ml</span>
          {isMax && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-3 h-3" />{c.largest}</span>}
          {isMin && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-500"><TrendingDown className="w-3 h-3" />{c.smallest}</span>}
        </div>
        <NumericBar value={cap} max={maxCapacity} isMin={isMin} isMax={isMax} />
      </div>
    );
  });
  const colorVals = products.map(p => (
    <div key={p.id} className="flex flex-wrap gap-1 items-center">
      {p.colors.slice(0, 5).map((color, ci) => (
        <div key={ci} className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0"
          style={{ backgroundColor: colorToHex[color] || '#9ca3af' }} title={color} />
      ))}
      <span className="text-[9px] text-gray-500 dark:text-gray-400">×{p.colors.length}</span>
    </div>
  ));
  const featuredVals    = products.map(p => <span key={p.id}>{renderBool(p.featured)}</span>);
  const bestSellerVals  = products.map(p => <span key={p.id}>{renderBool(p.bestSeller)}</span>);
  const newArrivalVals  = products.map(p => <span key={p.id}>{renderBool(p.newArrival)}</span>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 pt-20 md:pt-24 pb-8 md:pb-10">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative container-custom mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4 md:mb-6">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">{dict.nav.home}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{c.page_title}</span>
          </nav>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-2 md:mb-3">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {products.length} products
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">{c.page_title}</h1>
              <p className="text-white/70 text-xs md:text-sm">{c.page_subtitle}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/${lang}/bottles`}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs md:text-sm font-medium hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{c.back}</span>
              </Link>
              <button onClick={() => { clear(); setLocalIds([]); }}
                className="px-3 md:px-4 py-2 rounded-xl bg-red-500/20 border border-red-300/30 text-red-100 text-xs md:text-sm font-medium hover:bg-red-500/30 transition-colors">
                {c.clear_all}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── comparison body ──────────────────────────────────────────────── */}
      <div className="container-custom mx-auto px-3 sm:px-4 py-6 md:py-8">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">

          {/* ═══════════════════════════════════════════════════════════════
              MOBILE LAYOUT  (hidden on md+)
              Single overflow-x-auto container so header + all rows scroll
              together. Label column is 80px sticky-left; product columns
              are 130px each (fixed, not fr) so they don't collapse.
          ═══════════════════════════════════════════════════════════════ */}
          <div className="md:hidden overflow-x-auto rounded-t-2xl">
            <div className={mobileMinW}>

              {/* sticky product header */}
              <div className={cn(
                mobileHeaderGridCls,
                'sticky top-16 z-20 border-b-2 border-primary-100 dark:border-primary-900/50 bg-white dark:bg-gray-900 shadow-sm rounded-t-2xl'
              )}>
                <div className="sticky left-0 z-10 flex items-end px-2 pb-3 pt-4 border-r border-gray-100 dark:border-gray-800 rounded-tl-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Specs</span>
                </div>
                {products.map((p, i) => (
                  <div key={p.id} className={cn(
                    i < products.length - 1 && 'border-r border-gray-100 dark:border-gray-800',
                    i === products.length - 1 && 'rounded-tr-2xl',
                    i === 0 && 'bg-gradient-to-b from-primary-50/40 to-white dark:from-primary-900/10 dark:to-gray-900',
                  )}>
                    {productCardContent(p, i, true)}
                  </div>
                ))}
              </div>

              {/* mobile spec rows */}
              {renderMobileSection(c.spec_basic)}
              {renderMobileRow(c.product_id,  <Hash className="w-3 h-3" />,     productIdVals,   isDiff(products.map(p => p.id)))}
              {renderMobileRow(c.type,         <Tag className="w-3 h-3" />,      typeVals,        isDiff(products.map(p => p.type)))}
              {renderMobileRow(c.category,     <Layers className="w-3 h-3" />,   categoryVals,    isDiff(products.map(p => p.category)))}

              {renderMobileSection(c.spec_dimensions)}
              {renderMobileRow(c.weight,       <Weight className="w-3 h-3" />,   weightVals,      isDiff(weights))}
              {renderMobileRow(c.dimensions,   <Ruler className="w-3 h-3" />,    dimensionVals,   isDiff(products.map(p => `${p.dimensions.width}x${p.dimensions.height}`)))}
              {renderMobileRow(c.capacity,     <Package className="w-3 h-3" />,  capacityVals,    isDiff(capacities))}

              {renderMobileSection(c.spec_features)}
              {renderMobileRow(c.colors,       <Palette className="w-3 h-3" />,  colorVals,       isDiff(products.map(p => p.colors.length)))}
              {renderMobileRow(c.featured,     <Award className="w-3 h-3" />,    featuredVals,    isDiff(products.map(p => !!p.featured)))}
              {renderMobileRow(c.best_seller,  <TrendingUp className="w-3 h-3" />, bestSellerVals, isDiff(products.map(p => !!p.bestSeller)))}
              {renderMobileRow(c.new_arrival,  <Sparkles className="w-3 h-3" />, newArrivalVals, isDiff(products.map(p => !!p.newArrival)))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DESKTOP LAYOUT  (hidden below md)
              Sticky product header + spec rows below
          ═══════════════════════════════════════════════════════════════ */}
          <div className="hidden md:block overflow-x-auto">
            <div className={cn(
              'min-w-0',
              colCount === 2 && 'min-w-[600px]',
              colCount === 3 && 'min-w-[760px]',
              colCount === 4 && 'min-w-[920px]',
            )}>
              <div className={cn(
                'sticky top-16 z-30 grid border-b border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-t-2xl',
                colCount === 2 && 'grid-cols-[160px_1fr_1fr]',
                colCount === 3 && 'grid-cols-[160px_1fr_1fr_1fr]',
                colCount === 4 && 'grid-cols-[160px_1fr_1fr_1fr_1fr]',
              )}>
                <div className="flex items-end px-4 pb-4 pt-6 border-r border-gray-100 dark:border-gray-800 rounded-tl-2xl bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-800/50 dark:to-gray-900">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Specs</span>
                </div>
                {products.map((product, i) => (
                  <div key={product.id} className={cn(
                    i === products.length - 1 && 'rounded-tr-2xl',
                    i === 0 && 'bg-gradient-to-b from-primary-50/60 to-white dark:from-primary-900/20 dark:to-gray-900'
                  )}>
                    {productCardContent(product, i, false)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DESKTOP SPEC ROWS  (hidden on mobile via hidden md:grid)
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader title={c.spec_basic} colCount={colCount} />
          <SpecRow label={c.product_id} icon={<Hash className="w-3.5 h-3.5" />}   colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => p.id))}                                      values={productIdVals} />
          <SpecRow label={c.type}       icon={<Tag className="w-3.5 h-3.5" />}    colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => p.type))}                                    values={typeVals} />
          <SpecRow label={c.category}   icon={<Layers className="w-3.5 h-3.5" />} colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => p.category))}                                values={categoryVals} />

          <SectionHeader title={c.spec_dimensions} colCount={colCount} />
          <SpecRow label={c.weight}     icon={<Weight className="w-3.5 h-3.5" />} colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(weights)}                                                      values={weightVals} />
          <SpecRow label={c.dimensions} icon={<Ruler className="w-3.5 h-3.5" />}  colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => `${p.dimensions.width}x${p.dimensions.height}`))} values={dimensionVals} />
          <SpecRow label={c.capacity}   icon={<Package className="w-3.5 h-3.5" />} colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(capacities)}                                                  values={capacityVals} />

          <SectionHeader title={c.spec_features} colCount={colCount} />
          <SpecRow label={c.colors}     icon={<Palette className="w-3.5 h-3.5" />}   colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => p.colors.length))}   values={colorVals} />
          <SpecRow label={c.featured}   icon={<Award className="w-3.5 h-3.5" />}     colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => !!p.featured))}      values={featuredVals} />
          <SpecRow label={c.best_seller} icon={<TrendingUp className="w-3.5 h-3.5" />} colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => !!p.bestSeller))} values={bestSellerVals} />
          <SpecRow label={c.new_arrival} icon={<Sparkles className="w-3.5 h-3.5" />} colCount={colCount} rowIndex={rowIdx++} isDiff={isDiff(products.map(p => !!p.newArrival))}  values={newArrivalVals} />

        </div>{/* end table card */}

        {/* legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap gap-3 md:gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded border-l-2 border-amber-400 bg-amber-50/80" />
            <span>Highlighted = values differ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1.5 rounded-full bg-emerald-500" />
            <span>Largest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1.5 rounded-full bg-primary-400" />
            <span>Smallest</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
