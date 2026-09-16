import type { ProductCategoryBasic } from './publicApi';

// The catalog only ever renders three top-level product families.
export type ProductFamily = 'bottle' | 'cap' | 'pot';

// Pot assembly components (see `./productAssembly`). These are configurator-only:
// a customer picks them from a Pot's detail page, so they are deliberately kept
// out of every catalog listing — a Pot's *Body* is the shoppable product, its
// parts are not.
//
// Matched on the exact type/category name in both locales rather than by
// substring, because the loose matcher below would otherwise mis-file them:
// "Outer Cap"/"Tutup Luar" and "Inner Cap"/"Tutup Dalam" would be swept into the
// bottle-closure `cap` family, and "Plug"/"Sumbat" contains none of the keywords
// at all so it would classify as null and silently vanish from the site.
const ASSEMBLY_PART_NAMES = new Set([
  'outer cap', 'tutup luar',
  'plug', 'sumbat',
  'inner cap', 'tutup dalam',
  'inner pot', 'pot dalam',
]);

/** True for a pot component type/category — excluded from catalog listings. */
export function isAssemblyPart(nameEn: string, nameId: string): boolean {
  return ASSEMBLY_PART_NAMES.has(nameEn.trim().toLowerCase())
    || ASSEMBLY_PART_NAMES.has(nameId.trim().toLowerCase());
}

/** Catalog family, or null if the product doesn't belong in a catalog listing. */
export function classifyFamily(nameEn: string, nameId: string): ProductFamily | null {
  if (isAssemblyPart(nameEn, nameId)) return null;
  const name = `${nameEn} ${nameId}`.toLowerCase();
  if (name.includes('pot')) return 'pot';
  if (name.includes('bottle') || name.includes('botol')) return 'bottle';
  if (name.includes('cap') || name.includes('tutup') || name.includes('closure') || name.includes('lid')) return 'cap';
  return null;
}

export function familyOfCategory(category: ProductCategoryBasic): ProductFamily | null {
  return classifyFamily(category.name_en, category.name_id);
}

export function categoriesForFamily(categories: ProductCategoryBasic[], family: ProductFamily): ProductCategoryBasic[] {
  return categories.filter((c) => familyOfCategory(c) === family);
}

// Route slug each family resolves to.
export function familyToSlug(family: ProductFamily | null): 'bottles' | 'caps' | 'pot' {
  if (family === 'bottle') return 'bottles';
  if (family === 'pot') return 'pot';
  return 'caps';
}

/**
 * Catalog page a product's detail breadcrumb should link back to.
 *
 * Parts are unlisted but still have reachable detail pages (they're in the
 * sitemap feed and are linked from a Pot's configurator), so they point back at
 * the pot catalog — the assembly they belong to — rather than falling through
 * `familyToSlug(null)` to the unrelated caps page.
 */
export function breadcrumbSlugFor(nameEn: string, nameId: string): 'bottles' | 'caps' | 'pot' {
  if (isAssemblyPart(nameEn, nameId)) return 'pot';
  return familyToSlug(classifyFamily(nameEn, nameId));
}
