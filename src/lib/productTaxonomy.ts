import type { ProductCategoryBasic } from './publicApi';

// The catalog only ever renders three top-level product families. "Inner Pot"
// and "Outer Pot" are separate API types/categories but are merged into "pot"
// here so they share a single catalog section instead of being dropped.
export type ProductFamily = 'bottle' | 'cap' | 'pot';

export function classifyFamily(nameEn: string, nameId: string): ProductFamily | null {
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
