'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, ArrowUpRight, Box, Check, Heart, Link2, Share2 } from 'lucide-react';
import { ProductListItem } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem } from '@/lib/CompareContext';
import { useLike, useShare } from '@/hooks/useProductActions';
import { productPath, productSlug } from '@/lib/seo';
import { cn } from '@/lib/utils';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';

interface ApiProductCardProps {
  product: ProductListItem;
  lang: string;
  index?: number;
}

// Language-neutral engineering abbreviations — the card reads like a miniature
// datasheet, which is exactly what B2B packaging buyers scan for.
const SPEC_PRIORITY: Array<{ key: string; label: string }> = [
  { key: 'volume', label: 'VOL' },
  { key: 'neck_size', label: 'NECK' },
  { key: 'height', label: 'H' },
  { key: 'diameter', label: 'Ø' },
  { key: 'weight', label: 'WT' },
  { key: 'qty_per_box', label: 'QTY' },
];

/** Compact a raw attribute value for the spec strip ("24/40-410 mm" → "24/40-410", "80.50" → "80.5"). */
function compactValue(value: string): string {
  return value
    .replace(/\s+(mm|ml|gram|pcs)\s*$/i, '')
    .replace(/(\.\d*?)0+(?=$|\D)/g, (_, dec: string) => (dec === '.' ? '' : dec))
    .replace(/\.(?=$|\D)/g, '')
    .trim();
}

function unitOf(value: string): string {
  const m = value.match(/\s+(mm|ml|gram|pcs)\s*$/i);
  if (!m) return '';
  return m[1].toLowerCase() === 'gram' ? 'g' : m[1].toLowerCase();
}

export default function ApiProductCard({ product, lang, index = 0 }: ApiProductCardProps) {
  const { dict } = useLang();
  const { toggle, has, canAdd } = useCompare();
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const name = lang === 'id' ? product.name_id : product.name_en;
  const slug = productSlug(lang, product);
  const detailUrl = productPath(lang, product);
  const isComparing = has(product.id);

  const { liked, toggle: toggleLike } = useLike(slug);
  const { share, copied } = useShare(slug, name);
  const c = dict.catalog.product_card;

  const attrs = product.attributes ?? {};
  const material = attrs.material?.value;
  const has3D = !!product.three_d_file_path && /\.glb($|\?)/i.test(product.three_d_file_path);
  const specs = SPEC_PRIORITY
    .filter(({ key }) => attrs[key]?.value)
    .slice(0, 3)
    .map(({ key, label }) => ({
      key,
      label,
      value: compactValue(attrs[key].value),
      unit: unitOf(attrs[key].value),
    }));

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.thumbnail,
    };
    const ok = toggle(item);
    if (!ok) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full"
    >
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-primary-300/70 dark:group-hover:border-primary-700/60 group-hover:shadow-[0_20px_50px_-12px_rgba(43,135,245,0.25)] dark:group-hover:shadow-[0_20px_50px_-12px_rgba(43,135,245,0.2)]">

        {/* ── Image / stage ── */}
        <Link href={detailUrl} className="relative block aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/40 dark:from-gray-800 dark:via-gray-900 dark:to-primary-950/30">

          {/* Blueprint dot-grid — fades in on hover for the "technical drawing" feel */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 text-primary-500/25 dark:text-primary-400/20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          />

          <ImgWithFallback
            src={product.thumbnail}
            alt={name}
            fallback={PRODUCT_PLACEHOLDER}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />

          {/* Ruler ticks along the left edge — precision-measurement signature.
              Sits above the photo; mix-blend-difference keeps it visible on both
              dark studio shots and light placeholder backgrounds. */}
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-3 opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none mix-blend-difference"
            style={{
              backgroundImage: [
                'repeating-linear-gradient(to bottom, transparent 0, transparent 39px, rgba(255,255,255,0.9) 39px, rgba(255,255,255,0.9) 40px)',
                'repeating-linear-gradient(to bottom, transparent 0, transparent 7px, rgba(255,255,255,0.45) 7px, rgba(255,255,255,0.45) 8px)',
              ].join(','),
              backgroundSize: '12px 100%, 6px 100%',
              backgroundRepeat: 'no-repeat, no-repeat',
            }}
          />

          {/* Top chips — material + 3D availability */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {material && (
              <span className="px-2 py-0.5 rounded-md bg-gray-900/80 dark:bg-white/90 text-white dark:text-gray-900 text-[10px] font-mono font-bold tracking-widest backdrop-blur-sm shadow-sm">
                {material}
              </span>
            )}
            {has3D && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-500/90 text-white text-[10px] font-bold tracking-wider backdrop-blur-sm shadow-sm">
                <Box className="w-2.5 h-2.5" /> 3D
              </span>
            )}
          </div>

          {/* Like */}
          <motion.button
            onClick={(e) => { e.preventDefault(); toggleLike(); }}
            whileTap={{ scale: 0.8 }}
            aria-label={liked ? c.liked : c.like}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200',
              liked
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-white/75 dark:bg-gray-900/75 backdrop-blur-md border border-white/50 dark:border-gray-700/50 text-gray-400 hover:text-red-500 hover:bg-white/95'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5 transition-all', liked && 'fill-white')} />
          </motion.button>

          {/* Copied toast */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-14 right-3 px-2.5 py-1 rounded-full bg-gray-900/80 text-white text-[10px] font-medium backdrop-blur-sm border border-white/10"
              >
                {c.share_copied}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom scrim + view-details reveal */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
            <span className="flex items-center justify-center gap-1 w-full py-2.5 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md rounded-xl text-xs font-semibold text-gray-900 dark:text-white border border-white/60 dark:border-gray-700/60 shadow-lg">
              {c.view_details} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* ── Datasheet body ── */}
        <div className="flex-1 flex flex-col p-4">
          <Link href={detailUrl}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {name}
            </h3>
          </Link>

          {/* Spec strip — labelled readouts, not anonymous pills */}
          {specs.length > 0 && (
            <div className="mt-3 flex divide-x divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 overflow-hidden">
              {specs.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    'px-1.5 py-2 min-w-0 text-center',
                    // Neck-size values are the longest ("24/40-410") — give that slot more room
                    s.key === 'neck_size' ? 'flex-[1.5]' : 'flex-1',
                    // Cards are too narrow for a third readout on small phones
                    i === 2 && 'hidden sm:block'
                  )}
                >
                  <p className="text-[9px] font-bold tracking-[0.12em] text-primary-500/80 dark:text-primary-400/80">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-mono font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight" title={`${s.value} ${s.unit}`}>
                    {s.value}
                    {s.unit && <span className="text-gray-400 dark:text-gray-500 font-normal"> {s.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-3 flex items-center gap-1.5">
            <AnimatePresence mode="wait">
              {showMaxMsg ? (
                <motion.p
                  key="max"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center"
                >
                  {dict.catalog.compare.max_reached}
                </motion.p>
              ) : (
                <motion.button
                  key="compare"
                  onClick={handleCompareToggle}
                  disabled={!isComparing && !canAdd}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition-all duration-200',
                    isComparing
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/25'
                      : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30'
                  )}
                >
                  {isComparing
                    ? <><Check className="w-3 h-3" />{dict.catalog.compare.added}</>
                    : <><ArrowLeftRight className="w-3 h-3" />{dict.catalog.compare.toggle}</>
                  }
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              onClick={share}
              whileTap={{ scale: 0.88 }}
              aria-label={c.share}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200',
                copied
                  ? 'border-primary-400 text-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30'
              )}
            >
              {copied ? <Link2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>

        {/* Accent hairline — draws across the card foot on hover */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-primary-500 via-sky-400 to-primary-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>
    </motion.article>
  );
}
