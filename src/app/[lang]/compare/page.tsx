'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLang } from '@/lib/LangContext';
import { useCompare } from '@/lib/CompareContext';
import type { CompareConfig } from '@/lib/CompareContext';
import { getProductDetail, type ProductDetail } from '@/lib/publicApi';
import { buildDefaultAssembly } from '@/lib/defaultAssembly';
import { classifyFamily } from '@/lib/productTaxonomy';
import { productPath } from '@/lib/seo';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';
import Breadcrumb from '@/components/catalog/Breadcrumb';
import { cn, validGlbUrl } from '@/lib/utils';
import { type AssemblySlot, SLOT_BY_KEY, SLOTS_TOP_DOWN } from '@/lib/productAssembly';

const Product3DViewer = dynamic(
  () => import('@/components/catalog/detail/Product3DViewer'),
  { ssr: false, loading: () => <div className="aspect-square w-full animate-pulse bg-gray-100 dark:bg-gray-800" /> }
);

interface ResolvedConfig {
  config: CompareConfig;
  /** True when built here as the pot's standard assembly, not saved by the customer. */
  isDefault: boolean;
}

interface Row {
  key: string;
  label: string;
  values: React.ReactNode[];
  /** Comparable text per column, used to detect differences. */
  keys: string[];
}

const differs = (keys: string[]) => new Set(keys).size > 1;

function Swatch({ hex }: { hex: string }) {
  return <span aria-hidden className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: hex }} />;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const { lang, dict } = useLang();
  const { list, remove, clear } = useCompare();
  const c = dict.catalog.compare;
  const d = dict.catalog.product_detail;

  const [ids, setIds] = useState<string[]>(() => (searchParams.get('ids') ?? '').split(',').filter(Boolean));
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<string, ResolvedConfig>>({});
  const [media, setMedia] = useState<'photos' | '3d'>('3d');
  const [onlyDiff, setOnlyDiff] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(ids.map((id) => getProductDetail(id))).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((p): p is ProductDetail => p !== null));
      setLoading(false);
    });
    return () => { cancelled = true; };
    // Only the initial id list is fetched; removals just filter locally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use the configuration saved from the detail page; otherwise a pot gets its
  // standard assembly so it's compared with its parts, not as a bare body.
  useEffect(() => {
    let cancelled = false;
    products.forEach((p) => {
      if (configs[p.id]) return;
      const saved = list.find((item) => item.id === p.id)?.config;
      if (saved) {
        setConfigs((prev) => ({ ...prev, [p.id]: { config: saved, isDefault: false } }));
        return;
      }
      buildDefaultAssembly(p).then((config) => {
        if (!cancelled && config) setConfigs((prev) => ({ ...prev, [p.id]: { config, isDefault: true } }));
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const removeProduct = (id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    remove(id);
  };

  const name = (p: ProductDetail) => (lang === 'id' ? p.name_id : p.name_en);
  const typeName = (p: ProductDetail) => (lang === 'id' ? p.type.name_id : p.type.name_en);
  const catName = (p: ProductDetail) => (lang === 'id' ? p.category.name_id : p.category.name_en);
  const roleLabel = (role: string) => {
    // Saved configs may predate a slot rename — fall back to the generic Cap label.
    const slot = SLOT_BY_KEY[role as AssemblySlot];
    return slot ? c[slot.dictKey] : c.role_cap;
  };
  const baseLabel = (p: ProductDetail) =>
    classifyFamily(p.type.name_en, p.type.name_id) === 'pot' ? c.role_body : typeName(p);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">{c.loading}</p>
      </div>
    );
  }

  if (products.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-20 dark:bg-gray-950">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{c.empty_title}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{c.empty_desc}</p>
          <Link href={`/${lang}/products`} className="mt-6 inline-flex h-11 items-center rounded-md bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700">
            {c.go_to_catalog}
          </Link>
        </div>
      </div>
    );
  }

  const cols = products.length;
  // Phones: no label column — each spec's label is a full-width line above its
  // values, so product columns get the whole width (two fit on a 320px screen).
  // md+: classic table with a pinned label column.
  const gridStyle = { '--cols': cols } as React.CSSProperties;
  const gridCols = 'grid grid-cols-[repeat(var(--cols),minmax(136px,1fr))] md:grid-cols-[minmax(120px,180px)_repeat(var(--cols),minmax(180px,1fr))]';
  // First product column on phones has no divider to its left (there's no label column).
  const colBorder = (i: number) => cn('border-gray-200 dark:border-gray-800', i === 0 ? 'md:border-l' : 'border-l');
  const anyModel = products.some((p) => validGlbUrl(p.three_d_file_path));
  const showModels = media === '3d' && anyModel;

  // ── Rows ────────────────────────────────────────────────────────────────────
  const basicRows: Row[] = [
    { key: 'type', label: c.type, keys: products.map(typeName), values: products.map(typeName) },
    { key: 'category', label: c.category, keys: products.map(catName), values: products.map(catName) },
  ];

  const attrKeys = Array.from(new Set(products.flatMap((p) => p.attributes.map((a) => a.key))));
  const specRows: Row[] = attrKeys.map((key) => {
    const attrs = products.map((p) => p.attributes.find((a) => a.key === key));
    const sample = attrs.find(Boolean)!;
    return {
      key,
      label: lang === 'id' ? sample.label_id : sample.label_en,
      keys: attrs.map((a) => a?.value ?? '—'),
      values: attrs.map((a) => a?.value ?? null),
    };
  });

  const cfgs = products.map((p) => configs[p.id]?.config);
  const roles = SLOTS_TOP_DOWN.map((s) => s.key).filter((role) => cfgs.some((cfg) => cfg?.layers.some((l) => l.role === role)));
  // "Body" for pots, the product type otherwise; both when a comparison mixes them.
  const baseLabels = Array.from(new Set(products.map(baseLabel)));
  const baseRowLabel = baseLabels.length === 1 ? baseLabels[0] : baseLabels.join(' / ');
  const configRows: Row[] = cfgs.some(Boolean) ? [
    ...roles.map((role): Row => {
      const layers = cfgs.map((cfg) => cfg?.layers.find((l) => l.role === role));
      return {
        key: `cfg-${role}`,
        label: roleLabel(role),
        keys: layers.map((l) => (l ? `${l.name_en}|${l.colorName || l.color}` : '—')),
        values: layers.map((l) => l && (
          <span className="flex items-start gap-2">
            <Swatch hex={l.color} />
            <span>
              <span className="block">{lang === 'id' ? l.name_id : l.name_en}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{l.colorName || l.color.toUpperCase()}</span>
            </span>
          </span>
        )),
      };
    }),
    {
      key: 'cfg-base',
      label: baseRowLabel,
      keys: cfgs.map((cfg) => cfg?.baseColorName || cfg?.baseColor || '—'),
      values: cfgs.map((cfg) => cfg && (
        <span className="flex items-center gap-2"><Swatch hex={cfg.baseColor} />{cfg.baseColorName || cfg.baseColor.toUpperCase()}</span>
      )),
    },
  ] : [];

  const descRows: Row[] = products.some((p) => p.description) ? [{
    key: 'desc',
    label: c.description,
    keys: [],
    values: products.map((p) => {
      const text = p.description ? (lang === 'id' ? p.description.short_id : p.description.short_en) : null;
      return text && <span className="line-clamp-4 text-gray-600 dark:text-gray-400">{text}</span>;
    }),
  }] : [];

  const sections = [
    { title: c.spec_basic, rows: basicRows },
    { title: c.spec_dimensions, rows: specRows },
    { title: c.spec_configuration, rows: configRows },
    { title: c.spec_features, rows: descRows },
  ]
    .map((s) => ({ ...s, rows: onlyDiff ? s.rows.filter((r) => differs(r.keys)) : s.rows }))
    .filter((s) => s.rows.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-24 dark:bg-gray-950 md:pt-28">
      <div className="container-custom mx-auto px-4">
        <div className="mb-6 overflow-x-auto">
          <Breadcrumb items={[
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.nav.products, href: `/${lang}/products` },
            { label: c.page_title },
          ]} />
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{c.page_title}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{c.x_products.replace('{count}', String(cols))}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {anyModel && (
              <div role="tablist" className="inline-flex rounded-md border border-gray-300 p-0.5 dark:border-gray-700">
                {(['photos', '3d'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={media === tab}
                    onClick={() => setMedia(tab)}
                    className={cn(
                      'h-8 rounded px-3.5 text-sm font-medium',
                      media === tab ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    )}
                  >
                    {tab === 'photos' ? d.photos : d.view_3d}
                  </button>
                ))}
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="h-4 w-4 accent-primary-600" />
              {c.only_diff}
            </label>
            <button
              type="button"
              onClick={() => { clear(); setIds([]); setProducts([]); }}
              className="text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
            >
              {c.clear_all}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Product header */}
          <div className={cn(gridCols, 'border-b border-gray-200 dark:border-gray-800')} style={gridStyle}>
            <div className="hidden md:sticky md:left-0 md:z-10 md:block md:bg-white md:dark:bg-gray-900" />
            {products.map((p, i) => {
              const resolved = configs[p.id];
              const model = validGlbUrl(p.three_d_file_path);
              const thumb = p.images.find((img) => img.is_thumbnail)?.file_path ?? p.images[0]?.file_path;
              return (
                <div key={p.id} className={cn('relative flex min-w-0 flex-col p-3 md:p-4', colBorder(i))}>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    aria-label={`${c.remove} ${name(p)}`}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                    {showModels && model ? (
                      <Product3DViewer
                        compact
                        bottleModelUrl={model}
                        bottleColor={resolved?.config.baseColor ?? '#ffffff'}
                        layers={(resolved?.config.layers ?? []).map((l) => ({
                          key: l.role, url: l.url, color: l.color, scale: l.scale,
                          positionX: l.positionX, positionY: l.positionY, positionZ: l.positionZ,
                        }))}
                      />
                    ) : (
                      <ImgWithFallback src={thumb} alt={name(p)} fallback={PRODUCT_PLACEHOLDER} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{typeName(p)}</p>
                  <Link href={productPath(lang, p)} className="mt-0.5 text-sm font-medium text-gray-900 underline-offset-2 hover:underline dark:text-white">
                    {name(p)}
                  </Link>

                  {resolved && resolved.config.layers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{c.parts}</p>
                      <ul className="mt-1.5 space-y-1">
                        {[...resolved.config.layers].reverse().map((l) => (
                          <li key={l.role} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <Swatch hex={l.color} />
                            <span className="min-w-0 truncate"><span className="text-gray-500 dark:text-gray-400">{roleLabel(l.role)}:</span> {lang === 'id' ? l.name_id : l.name_en}</span>
                          </li>
                        ))}
                        <li className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <Swatch hex={resolved.config.baseColor} />
                          <span className="min-w-0 truncate"><span className="text-gray-500 dark:text-gray-400">{baseLabel(p)}:</span> {name(p)}</span>
                        </li>
                      </ul>
                      {resolved.isDefault && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{c.standard_assembly}</p>}
                    </div>
                  )}

                  <Link href={productPath(lang, p)} className="mt-auto inline-flex items-center gap-1 pt-3 text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
                    {c.view_details} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Spec sections */}
          {sections.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">{c.no_diff}</p>
          )}
          {sections.map((section) => (
            <div key={section.title}>
              <div className={cn(gridCols, 'bg-gray-50 dark:bg-gray-800/50')} style={gridStyle}>
                <h2 className="col-span-full px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-white md:px-4">
                  <span className="sticky left-3 md:left-4">{section.title}</span>
                </h2>
              </div>
              {section.rows.map((row) => {
                const isDiff = differs(row.keys);
                return (
                  <div key={row.key} className={cn(gridCols, 'border-t border-gray-200 text-sm dark:border-gray-800')} style={gridStyle}>
                    <div className="col-span-full px-3 pt-2.5 text-xs text-gray-500 dark:text-gray-400 md:sticky md:left-0 md:z-10 md:col-span-1 md:bg-white md:px-4 md:py-3 md:text-sm md:dark:bg-gray-900">
                      <span className="sticky left-3 md:static">{row.label}</span>
                    </div>
                    {row.values.map((v, i) => (
                      <div
                        key={i}
                        className={cn(
                          'min-w-0 break-words px-3 pb-2.5 pt-1 text-gray-900 dark:text-gray-100 md:px-4 md:py-3',
                          colBorder(i),
                          isDiff && 'bg-amber-50 dark:bg-amber-900/15'
                        )}
                      >
                        {v ?? <Minus className="h-4 w-4 text-gray-300 dark:text-gray-600" aria-label="—" />}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span aria-hidden className="h-3 w-3 rounded-sm border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/15" />
          {c.legend_diff}
        </p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return <Suspense><CompareContent /></Suspense>;
}
