/**
 * The assemblies featured in the home hero: a pot (the flagship, shown fully
 * exploded) and a bottle (a secondary companion) beside it.
 *
 * Resolved on the server so the hero paints with its parts already known — the
 * viewer only has to stream the GLBs, not wait on six round trips first.
 *
 * Slots come from each linked part's own product type, exactly like the product
 * detail page, so this stays correct if the catalogue is re-seeded.
 */

import { getProductDetail, getProductCompatibilities, type ProductDetail } from './publicApi';
import {
  classifyByTypeName,
  layerPlacement,
  SLOT_BY_KEY,
  type AssemblySlot,
} from './productAssembly';

/** The pot the hero features — all five assembly layers are in play. */
export const HERO_POT_SLUG = 'pot-devinda-10-15-30-gr';
/** The bottle shown beside it — its cap, exploded off the body. */
export const HERO_BOTTLE_SLUG = 'bottle-dioly-250ml';

const GLB_RE = /\.glb($|\?)/i;
const isGlb = (url?: string | null): url is string => !!url && GLB_RE.test(url);

export interface HeroPart {
  slot: AssemblySlot;
  /** 1 = bottom of the stack … 5 = top. Drives stacking order. */
  stack: number;
  url: string;
  scale: number;
  /** Assembled resting height — the midpoint the storefront renders at. */
  restY: number;
  offsetX: number;
  offsetZ: number;
}

export interface HeroAssemblyData {
  /** The Body — the product's own model. */
  baseUrl: string;
  /** Attached parts, ordered bottom of the stack first. */
  parts: HeroPart[];
}

async function resolveHeroAssembly(
  slug: string,
  options?: { singleCap?: boolean },
): Promise<HeroAssemblyData | null> {
  const product = await getProductDetail(slug);
  if (!product || !isGlb(product.three_d_file_path)) return null;

  const compatibility = await getProductCompatibilities(slug);
  const allItems = compatibility?.compatible ?? [];
  // The compatibility list holds every *alternative* a customer could pick for
  // a slot (a bottle can link half a dozen different pumps/sprayers as cap
  // options) — the hero is a fixed product photo, not a picker, so a
  // single-cap assembly (the bottle) just takes the first one, full stop.
  const items = options?.singleCap ? allItems.slice(0, 1) : allItems;
  // One detail fetch per part: the compatibility rows carry no product type, and
  // the type name is what decides which slot a part belongs in.
  const details = await Promise.all(items.map((item) => getProductDetail(item.id)));

  const parts = items
    .map((item, i): HeroPart | null => {
      const detail: ProductDetail | null = details[i];
      const url = detail?.three_d_file_path || item.three_d_file_path;
      if (!isGlb(url)) return null;
      const slot = classifyByTypeName(detail?.type?.name_en);
      const def = SLOT_BY_KEY[slot];
      const placement = layerPlacement(item);
      return {
        slot,
        stack: def.stack,
        url,
        scale: placement.scale,
        restY: placement.mid,
        offsetX: placement.offsetX,
        offsetZ: placement.offsetZ,
      };
    })
    .filter((p): p is HeroPart => p !== null)
    // Bottom-up: Product3DViewer derives each layer's draw order from its index,
    // which is what keeps interpenetrating surfaces from flickering.
    .sort((a, b) => a.stack - b.stack);

  if (parts.length === 0) return null;

  return {
    baseUrl: product.three_d_file_path,
    parts,
  };
}

/** Both featured assemblies, resolved together so the hero waits on one round trip. */
export async function getHeroAssemblies(): Promise<{
  pot: HeroAssemblyData | null;
  bottle: HeroAssemblyData | null;
}> {
  const [pot, bottle] = await Promise.all([
    resolveHeroAssembly(HERO_POT_SLUG),
    resolveHeroAssembly(HERO_BOTTLE_SLUG, { singleCap: true }),
  ]);
  return { pot, bottle };
}
