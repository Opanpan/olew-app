'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Link2, Share2 } from 'lucide-react';
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

// The specs buyers scan first, in order; the card shows the first three present.
const SPEC_PRIORITY = ['volume', 'neck_size', 'height', 'diameter', 'weight'];

/** Tidy a raw attribute value: "80.50 mm" → "80.5 mm", "13 gram" → "13 g". */
function formatValue(value: string): string {
  return value
    .trim()
    .replace(/(\d)\.(\d*?)0+(?=\D|$)/g, (_, int: string, dec: string) => (dec ? `${int}.${dec}` : int))
    .replace(/\s*gram$/i, ' g');
}

export default function ApiProductCard({ product, lang }: ApiProductCardProps) {
  const { dict } = useLang();
  const { toggle, has } = useCompare();
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
    .filter((key) => attrs[key]?.value)
    .slice(0, 3)
    .map((key) => ({
      key,
      label: lang === 'id' ? attrs[key].label_id : attrs[key].label_en,
      value: formatValue(attrs[key].value),
    }));
  const meta = [material, has3D && c.has_3d].filter(Boolean).join(' · ');

  const handleCompare = () => {
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.thumbnail,
    };
    if (!toggle(item)) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2500);
    }
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        <ImgWithFallback
          src={product.thumbnail}
          alt=""
          fallback={PRODUCT_PLACEHOLDER}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
          loading="lazy"
        />
        <button
          type="button"
          onClick={toggleLike}
          aria-label={liked ? c.liked : c.like}
          aria-pressed={liked}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 hover:text-red-600 dark:bg-gray-900 dark:text-gray-300"
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-red-600 text-red-600')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        {meta && <p className="text-xs text-gray-500 dark:text-gray-400">{meta}</p>}

        {/* Stretched link: the whole card opens the product; the buttons sit above it (z-10). */}
        <h3 className="mt-1 text-sm font-medium leading-snug text-gray-900 dark:text-white line-clamp-2">
          <Link
            href={detailUrl}
            className="underline-offset-2 after:absolute after:inset-0 group-hover:underline focus-visible:outline-none after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-primary-600"
          >
            {name}
          </Link>
        </h3>

        {specs.length > 0 && (
          <dl className="mt-3 divide-y divide-gray-200 border-y border-gray-200 text-xs dark:divide-gray-800 dark:border-gray-800">
            {specs.map((s) => (
              <div key={s.key} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt className="text-gray-500 dark:text-gray-400">{s.label}</dt>
                <dd className="truncate text-right tabular-nums text-gray-900 dark:text-gray-100" title={s.value}>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-2">
          {showMaxMsg ? (
            <p role="status" className="min-h-[36px] flex items-center text-xs text-amber-700 dark:text-amber-400">
              {dict.catalog.compare.max_reached}
            </p>
          ) : (
            <label className="flex min-h-[36px] cursor-pointer items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isComparing}
                onChange={handleCompare}
                className="h-4 w-4 accent-primary-600 dark:accent-primary-400"
              />
              {dict.catalog.compare.toggle}
            </label>
          )}
          <button
            type="button"
            onClick={share}
            aria-label={copied ? c.share_copied : c.share}
            title={copied ? c.share_copied : c.share}
            className={cn(
              '-mr-2 flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800',
              copied ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {copied ? <Link2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
