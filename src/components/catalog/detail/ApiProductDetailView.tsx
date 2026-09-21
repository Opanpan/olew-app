'use client';

import { useState, useRef, useMemo, useEffect, useCallback, Component, type ReactNode } from 'react';
import { ArrowRight, Heart, Share2, Link2, MessageCircle, Layers, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductDetail, ProductListItem, ProductCompatibility, CompatibleProduct, getProductDetail } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { useLike, useShare } from '@/hooks/useProductActions';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem, CompareConfig } from '@/lib/CompareContext';
import ProductGallery from './ProductGallery';
import Breadcrumb from '../Breadcrumb';
import ApiProductCard from '../ApiProductCard';
import PartConfigurator, { type PartRow } from './PartConfigurator';
import type { PartColor } from './ColorField';
import { PRODUCT_COLORS, colorToHex } from './EnhancedColorPicker';
import { classifyFamily, breadcrumbSlugFor } from '@/lib/productTaxonomy';
import {
  type AssemblySlot, SLOTS_TOP_DOWN, SLOTS_BOTTOM_UP, SLOT_BY_KEY,
  emptyBySlot, slotRecordOf, classifyByTypeName, layerPlacement,
} from '@/lib/productAssembly';
import { WHATSAPP_NUMBER } from '@/lib/contact';
import { productPath } from '@/lib/seo';
import { cn, validGlbUrl } from '@/lib/utils';

const Product3DViewer = dynamic(() => import('./Product3DViewer'), { ssr: false });

// Assembly slots a compatible item can occupy — see `@/lib/productAssembly` for
// the stacking model. Classified by the linked product's own product_type (the
// API returns no slot field); "cap" is the fallback both while classification is
// in flight and for anything unrecognised, which preserves plain Bottle+Cap
// behaviour unchanged.
//
// Ordered top-of-the-stack first (Outer Cap → Inner Cap → Plug → Inner Pot) so
// the configurator reads down the pot in physical order.
const COMPAT_ROLES = SLOTS_TOP_DOWN.map((s) => s.key);
type CompatRole = AssemblySlot;
/** Configurator row key: the base product ('body') or an attachable slot. */
type PartKey = 'body' | CompatRole;
const ALL_PART_KEYS: PartKey[] = ['body', ...COMPAT_ROLES];

// Max upward offset (real 3D units) a customer can raise a layer from its
// admin-configured default position. Shown to the customer as 0–100%. Tall
// enough to clear a fully exploded four-layer pot (4 × EXPLODE_STEP).
const POSITION_MAX = 2.5;
// Per-layer spacing used by "Separate parts" (exploded view). Wide enough that
// every layer reads as its own part instead of touching the one below it.
const EXPLODE_STEP = 0.5;

const DEFAULT_COLOR: PartColor = { hex: colorToHex['White'] ?? '#ffffff', name: 'White' };

// Catches GLB load failures so a broken model doesn't take the page down.
interface EBState { hasError: boolean }
class Viewer3DErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function slotLabel(compareDict: Record<string, string>, role: CompatRole): string {
  return compareDict[SLOT_BY_KEY[role].dictKey];
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
  const cmp = dict.catalog.compare;
  const pc = dict.catalog.product_card;

  const productName = lang === 'id' ? product.name_id : product.name_en;
  const typeName = lang === 'id' ? product.type.name_id : product.type.name_en;
  const categoryLabel = lang === 'id' ? product.category.name_id : product.category.name_en;
  // Parts are unlisted in the catalog but still have reachable detail pages, so
  // their breadcrumb points back at the pot catalog rather than defaulting to caps.
  const categoryPath = breadcrumbSlugFor(product.type.name_en, product.type.name_id);
  const isPot = classifyFamily(product.type.name_en, product.type.name_id) === 'pot';

  const modelUrl = validGlbUrl(product.three_d_file_path);
  const imageUrls = [...product.images].sort((a, b) => a.sort_order - b.sort_order).map((img) => img.file_path);
  const hasCompat = (compatibility?.compatible.length ?? 0) > 0;

  // Configurable products open straight on the 3D view — that's where the work happens.
  const [media, setMedia] = useState<'photos' | '3d'>(modelUrl && (hasCompat || imageUrls.length === 0) ? '3d' : 'photos');
  const show3D = useCallback(() => { if (modelUrl) setMedia('3d'); }, [modelUrl]);

  // ── Compatible parts: classification ─────────────────────────────────────────
  // Each item's slot comes from its own product type, fetched eagerly (metadata,
  // not the 3D file) together with a thumbnail for the model picker.
  const [idToRole, setIdToRole] = useState<Record<string, CompatRole>>({});
  const [idToThumb, setIdToThumb] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    const items = compatibility?.compatible ?? [];
    if (items.length === 0) return;
    let cancelled = false;
    Promise.all(items.map((item) => getProductDetail(item.id))).then((details) => {
      if (cancelled) return;
      const roles: Record<string, CompatRole> = {};
      const thumbs: Record<string, string | undefined> = {};
      items.forEach((item, i) => {
        const detail = details[i];
        roles[item.id] = classifyByTypeName(detail?.type?.name_en);
        thumbs[item.id] = detail?.images.find((img) => img.is_thumbnail)?.file_path ?? detail?.images[0]?.file_path;
      });
      setIdToRole(roles);
      setIdToThumb(thumbs);
    });
    return () => { cancelled = true; };
  }, [compatibility]);

  const compatByRole = useMemo(() => {
    const groups = slotRecordOf<CompatibleProduct[]>(() => []);
    for (const item of compatibility?.compatible ?? []) groups[idToRole[item.id] ?? 'cap'].push(item);
    return groups;
  }, [compatibility, idToRole]);
  const availableRoles = COMPAT_ROLES.filter((role) => compatByRole[role].length > 0);

  // ── Configuration state ──────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<Record<CompatRole, string | null>>(emptyBySlot(null));
  const [partDetail, setPartDetail] = useState<Record<CompatRole, ProductDetail | null>>(emptyBySlot(null));
  const [partLoading, setPartLoading] = useState<Record<CompatRole, boolean>>(emptyBySlot(false));
  const [colors, setColors] = useState<Record<PartKey, PartColor>>(
    () => Object.fromEntries(ALL_PART_KEYS.map((k) => [k, DEFAULT_COLOR])) as Record<PartKey, PartColor>
  );
  const [lift, setLift] = useState<Record<CompatRole, number>>(emptyBySlot(0));
  const [openPart, setOpenPart] = useState<string | null>(null);
  // Latest requested id per slot, so a slow detail fetch can't overwrite a newer pick.
  const latestPick = useRef<Record<string, string | null>>({});

  const selectedItems = useMemo(() => {
    const out = {} as Record<CompatRole, CompatibleProduct | null>;
    for (const role of COMPAT_ROLES) out[role] = compatByRole[role].find((c) => c.id === selectedId[role]) ?? null;
    return out;
  }, [compatByRole, selectedId]);
  const activeRoles = COMPAT_ROLES.filter((role) => selectedItems[role]);

  const selectModel = useCallback(async (role: CompatRole, id: string | null) => {
    latestPick.current[role] = id;
    setSelectedId((prev) => ({ ...prev, [role]: id }));
    // Lift is an offset from the new model's own default position, so it restarts at 0.
    setLift((prev) => ({ ...prev, [role]: 0 }));
    setPartDetail((prev) => ({ ...prev, [role]: null }));
    if (!id) { setPartLoading((prev) => ({ ...prev, [role]: false })); return; }
    setPartLoading((prev) => ({ ...prev, [role]: true }));
    const detail = await getProductDetail(id);
    if (latestPick.current[role] !== id) return;
    setPartDetail((prev) => ({ ...prev, [role]: detail }));
    setPartLoading((prev) => ({ ...prev, [role]: false }));
  }, []);

  // A pot starts fully assembled: the first model of every slot is pre-selected
  // once classification is done (before that, everything sits in "cap").
  const didAutoSelect = useRef(false);
  useEffect(() => {
    if (didAutoSelect.current || !isPot) return;
    const items = compatibility?.compatible ?? [];
    if (items.length === 0 || items.some((it) => idToRole[it.id] === undefined)) return;
    didAutoSelect.current = true;
    for (const role of COMPAT_ROLES) {
      const first = compatByRole[role][0];
      if (first) selectModel(role, first.id);
    }
  }, [isPot, compatibility, idToRole, compatByRole, selectModel]);

  // Bottom-up: the viewer derives each layer's draw order from its array position.
  const layers = SLOTS_BOTTOM_UP.flatMap(({ key: role }) => {
    const item = selectedItems[role];
    if (!item) return [];
    const bounds = layerPlacement(item);
    return [{
      role,
      item,
      url: validGlbUrl(partDetail[role]?.three_d_file_path || item.three_d_file_path),
      scale: bounds.scale,
      positionX: bounds.offsetX,
      positionY: bounds.mid + lift[role],
      positionZ: bounds.offsetZ,
    }];
  });

  const anyLifted = activeRoles.some((role) => lift[role] > 0);
  const toggleSeparated = () => {
    show3D();
    if (anyLifted) {
      setLift(emptyBySlot(0));
      return;
    }
    const next = emptyBySlot(0);
    SLOTS_BOTTOM_UP.filter(({ key }) => selectedItems[key]).forEach(({ key }, i) => {
      next[key] = Math.min(POSITION_MAX, (i + 1) * EXPLODE_STEP);
    });
    setLift(next);
  };

  // ── Like, share, compare ─────────────────────────────────────────────────────
  const { liked, likeCount, toggle: toggleLike } = useLike(slug, product.like_count);
  const { share, copied } = useShare(slug, productName);
  const { toggle: toggleCompare, has: hasCompare } = useCompare();
  const isComparing = hasCompare(product.id);
  const [showMaxMsg, setShowMaxMsg] = useState(false);

  const handleCompare = () => {
    // Snapshot the configuration so the Compare page can rebuild the same assembly.
    const config: CompareConfig = {
      baseColor: colors.body.hex,
      baseColorName: colors.body.name,
      layers: layers.map((l) => ({
        role: l.role,
        name_en: l.item.name_en,
        name_id: l.item.name_id,
        url: l.url,
        color: colors[l.role].hex,
        colorName: colors[l.role].name,
        scale: l.scale,
        positionX: l.positionX,
        positionY: l.positionY,
        positionZ: l.positionZ,
      })),
    };
    const item: CompareItem = {
      id: product.id,
      name_en: product.name_en,
      name_id: product.name_id,
      thumbnail: product.images.find((i) => i.is_thumbnail)?.file_path ?? product.images[0]?.file_path,
      three_d_file_path: product.three_d_file_path,
      config,
    };
    if (!toggleCompare(item)) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2500);
    }
  };

  // ── WhatsApp quote: base product + every selected part with its colour ───────
  const colorText = (c: PartColor) => c.name || c.hex.toUpperCase();
  const buildQuoteMessage = () => {
    const colorWord = d.part_color;
    const baseLabel = isPot ? cmp.role_body : typeName;
    const lines = [
      lang === 'id' ? 'Halo, saya tertarik dengan produk berikut:' : "Hi, I'm interested in the following product:",
      '',
      `*${baseLabel}:* ${productName}`,
      `${colorWord}: ${colorText(colors.body)}`,
    ];
    for (const role of activeRoles) {
      const item = selectedItems[role]!;
      lines.push('', `*${slotLabel(cmp, role)}:* ${lang === 'id' ? item.name_id : item.name_en}`, `${colorWord}: ${colorText(colors[role])}`);
    }
    return lines.join('\n');
  };
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteMessage())}`;

  // ── Configurator rows ────────────────────────────────────────────────────────
  const parts: PartRow[] = [
    ...availableRoles.map((role): PartRow => ({
      key: role,
      label: slotLabel(cmp, role),
      models: compatByRole[role].map((c) => ({ id: c.id, name: lang === 'id' ? c.name_id : c.name_en, thumb: idToThumb[c.id] })),
      selectedModelId: selectedId[role],
      loading: partLoading[role],
      viewHref: partDetail[role] ? productPath(lang, partDetail[role]!) : null,
      color: colors[role],
      lift: lift[role],
    })),
    { key: 'body', label: isPot ? cmp.role_body : typeName, fixedName: productName, color: colors.body },
  ];

  const description = product.description
    ? (lang === 'id' ? product.description.long_id || product.description.short_id : product.description.long_en || product.description.short_en)
    : null;
  const sortedAttributes = [...product.attributes].sort((a, b) => a.sort_order - b.sort_order);
  const marketplaces = [
    { name: 'Shopee', href: product.shopee_url },
    { name: 'Tokopedia', href: product.tokopedia_url },
  ].filter((m): m is { name: string; href: string } => !!m.href);

  const iconButton = 'flex h-10 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:border-gray-500 dark:border-gray-700 dark:text-gray-300';
  const sectionTitle = 'text-base font-semibold text-gray-900 dark:text-white';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 dark:bg-gray-950 md:pt-28">
      <section className="container-custom mx-auto px-4 pb-16 pt-4 md:pt-6">
        <div className="mb-6 overflow-x-auto">
          <Breadcrumb
            items={[
              { label: dict.nav.home, href: `/${lang}` },
              { label: dict.nav.products, href: `/${lang}/products` },
              { label: typeName, href: `/${lang}/products/${categoryPath}` },
              { label: productName },
            ]}
          />
        </div>

        {/* Mobile: header → media → details. Desktop: sticky media left, header + details right. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 [grid-template-areas:'header'_'media'_'main'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'media_header'_'media_main']">

          {/* ── Header ── */}
          <header className="[grid-area:header]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {typeName}{categoryLabel && categoryLabel !== typeName && ` · ${categoryLabel}`}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-3xl">
              {productName}
            </h1>
            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={toggleLike} aria-pressed={liked} className={iconButton}>
                <Heart className={cn('h-4 w-4', liked && 'fill-red-600 text-red-600')} aria-hidden />
                {liked ? pc.liked : pc.like}
                {likeCount > 0 && <span className="tabular-nums text-gray-500">{likeCount}</span>}
              </button>
              <button type="button" onClick={share} className={iconButton}>
                {copied ? <Link2 className="h-4 w-4 text-primary-600" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                {copied ? pc.share_copied : pc.share}
              </button>
            </div>
          </header>

          {/* ── Media ── */}
          <div className="[grid-area:media] lg:sticky lg:top-28 lg:self-start">
            {modelUrl && imageUrls.length > 0 && (
              <div role="tablist" aria-label={d.view_3d_preview} className="mb-3 inline-flex rounded-md border border-gray-300 p-0.5 dark:border-gray-700">
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

            {media === '3d' && modelUrl ? (
              <div className="relative">
                <Viewer3DErrorBoundary
                  fallback={
                    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-900">
                      <p className="text-sm text-gray-500">{d.model_unavailable}</p>
                    </div>
                  }
                >
                  <Product3DViewer
                    bottleModelUrl={modelUrl}
                    bottleColor={colors.body.hex}
                    bottleScale={1}
                    layers={layers.map((l) => ({
                      key: l.role,
                      url: l.url,
                      color: colors[l.role].hex,
                      scale: l.scale,
                      positionX: l.positionX,
                      positionY: l.positionY,
                      positionZ: l.positionZ,
                    }))}
                  />
                </Viewer3DErrorBoundary>
                {activeRoles.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSeparated}
                    aria-pressed={anyLifted}
                    className="absolute left-3 top-3 z-10 flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <Layers className="h-4 w-4" aria-hidden />
                    {anyLifted ? d.reassemble : d.separate_parts}
                  </button>
                )}
              </div>
            ) : (
              <ProductGallery images={imageUrls.length > 0 ? imageUrls : ['']} productName={productName} />
            )}
          </div>

          {/* ── Details ── */}
          <div className="min-w-0 space-y-10 [grid-area:main]">
            {modelUrl && (
              <section aria-labelledby="customize-title">
                <h2 id="customize-title" className={sectionTitle}>{d.customize}</h2>
                <p className="mb-4 mt-1 text-sm text-gray-600 dark:text-gray-400">{d.customize_hint}</p>
                <PartConfigurator
                  parts={parts}
                  openKey={openPart}
                  presets={PRODUCT_COLORS}
                  liftMax={POSITION_MAX}
                  onOpen={setOpenPart}
                  onSelectModel={(key, id) => { show3D(); selectModel(key as CompatRole, id); }}
                  onColor={(key, color) => { show3D(); setColors((prev) => ({ ...prev, [key]: color })); }}
                  onLift={(key, value) => { show3D(); setLift((prev) => ({ ...prev, [key]: value })); }}
                />
              </section>
            )}

            {/* ── Actions ── */}
            <section className="space-y-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {d.inquiry}
              </a>
              {modelUrl && <p className="text-center text-xs text-gray-500 dark:text-gray-400">{d.quote_note}</p>}
              <button
                type="button"
                onClick={handleCompare}
                aria-pressed={isComparing}
                className={cn(
                  'flex h-11 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium',
                  isComparing
                    ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                    : 'border-gray-300 text-gray-800 hover:border-gray-500 dark:border-gray-700 dark:text-gray-200'
                )}
              >
                <input type="checkbox" readOnly checked={isComparing} tabIndex={-1} aria-hidden className="pointer-events-none h-4 w-4 accent-primary-600" />
                {showMaxMsg ? cmp.max_reached : cmp.toggle}
              </button>
              {marketplaces.length > 0 && (
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-gray-600 dark:text-gray-400">
                  {d.also_on}
                  {marketplaces.map((m) => (
                    <a key={m.name} href={m.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-gray-900 underline-offset-4 hover:underline dark:text-white">
                      {m.name}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ))}
                </p>
              )}
            </section>

            {sortedAttributes.length > 0 && (
              <section aria-labelledby="specs-title">
                <h2 id="specs-title" className={cn(sectionTitle, 'mb-3')}>{d.specifications}</h2>
                <dl className="divide-y divide-gray-200 border-y border-gray-200 text-sm dark:divide-gray-800 dark:border-gray-800">
                  {sortedAttributes.map((attr) => (
                    <div key={attr.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-2.5">
                      <dt className="text-gray-500 dark:text-gray-400">{lang === 'id' ? attr.label_id : attr.label_en}</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {description && (
              <section aria-labelledby="desc-title">
                <h2 id="desc-title" className={cn(sectionTitle, 'mb-3')}>{d.description}</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{description}</p>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <section className="container-custom mx-auto px-4 pb-16 md:pb-20">
          <div className="border-t border-gray-200 pt-10 dark:border-gray-800">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{d.related_products}</h2>
              <Link href={`/${lang}/products/${categoryPath}`} className="inline-flex items-center gap-1 text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
                {d.view_all} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-6">
              {relatedProducts.map((item) => (
                <ApiProductCard key={item.id} product={item} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
