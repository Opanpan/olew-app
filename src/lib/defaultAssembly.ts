import { getProductCompatibilities, getProductDetail, type CompatibleProduct, type ProductDetail } from '@/lib/publicApi';
import type { CompareConfig } from '@/lib/CompareContext';
import { classifyFamily } from '@/lib/productTaxonomy';
import { SLOTS_BOTTOM_UP, classifyByTypeName, layerPlacement, type AssemblySlot } from '@/lib/productAssembly';
import { validGlbUrl } from '@/lib/utils';

const WHITE = { hex: '#ffffff', name: 'White' };

/**
 * The standard assembly for a pot: the first compatible model in every slot,
 * all white, at the admin default positions — exactly what the detail page
 * pre-selects. Used when a pot reaches Compare without a saved configuration
 * (e.g. added from a catalog card), so it isn't compared as a bare body.
 * Returns undefined for non-pots or when the pot has no linked parts.
 */
export async function buildDefaultAssembly(product: ProductDetail): Promise<CompareConfig | undefined> {
  if (classifyFamily(product.type.name_en, product.type.name_id) !== 'pot') return undefined;
  const compat = await getProductCompatibilities(product.id);
  const items = compat?.compatible ?? [];
  if (items.length === 0) return undefined;

  // Slots come from each part's own product type (the API doesn't send one).
  const details = await Promise.all(items.map((item) => getProductDetail(item.id)));
  const firstBySlot = new Map<AssemblySlot, { item: CompatibleProduct; detail: ProductDetail | null }>();
  items.forEach((item, i) => {
    const slot = classifyByTypeName(details[i]?.type?.name_en);
    if (!firstBySlot.has(slot)) firstBySlot.set(slot, { item, detail: details[i] });
  });

  const layers = SLOTS_BOTTOM_UP.flatMap(({ key }) => {
    const hit = firstBySlot.get(key);
    if (!hit) return [];
    const place = layerPlacement(hit.item);
    return [{
      role: key,
      name_en: hit.item.name_en,
      name_id: hit.item.name_id,
      url: validGlbUrl(hit.detail?.three_d_file_path || hit.item.three_d_file_path),
      color: WHITE.hex,
      colorName: WHITE.name,
      scale: place.scale,
      positionX: place.offsetX,
      positionY: place.mid,
      positionZ: place.offsetZ,
    }];
  });
  return layers.length ? { baseColor: WHITE.hex, baseColorName: WHITE.name, layers } : undefined;
}
