/**
 * The pot assembly featured in the home hero.
 *
 * Resolved on the server so the hero paints with its parts already known — the
 * viewer only has to stream the GLBs, not wait on six round trips first.
 *
 * Slots come from the linked part's own product type, exactly like the product
 * detail page, so this stays correct if the catalogue is re-seeded.
 */

import {
  getProductDetail,
  getProductCompatibilities,
  type ProductDetail,
} from './publicApi';
import {
  classifyByTypeName,
  layerPlacement,
  SLOT_BY_KEY,
  type AssemblySlot,
} from './productAssembly';

/** Which product the hero shows. A pot, so all five assembly layers are in play. */
export const HERO_PRODUCT_SLUG = 'pot-devinda-10-15-30-gr';

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
  /** The Body — the pot product's own model. */
  baseUrl: string;
  /** Attached parts, ordered bottom of the stack first. */
  parts: HeroPart[];
}

export async function getHeroAssembly(): Promise<HeroAssemblyData | null> {
  const product = await getProductDetail(HERO_PRODUCT_SLUG);
  if (!product || !isGlb(product.three_d_file_path)) return null;

  const compatibility = await getProductCompatibilities(HERO_PRODUCT_SLUG);
  const items = compatibility?.compatible ?? [];
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
