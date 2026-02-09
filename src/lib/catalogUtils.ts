import { Product, FilterState } from '@/types/catalog';

/**
 * Filters products based on the provided filter state
 */
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  return products.filter((product) => {
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false;
    }

    // Weight range filter
    const [minWeight, maxWeight] = filters.weightRange;
    if (
      product.dimensions.weight < minWeight ||
      product.dimensions.weight > maxWeight
    ) {
      return false;
    }

    // Width range filter
    const [minWidth, maxWidth] = filters.widthRange;
    if (
      product.dimensions.width < minWidth ||
      product.dimensions.width > maxWidth
    ) {
      return false;
    }

    // Height range filter
    const [minHeight, maxHeight] = filters.heightRange;
    if (
      product.dimensions.height < minHeight ||
      product.dimensions.height > maxHeight
    ) {
      return false;
    }

    // Price range filter
    const [minPrice, maxPrice] = filters.priceRange;
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = `${product.name} ${product.type} ${product.colors.join(' ')}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts products based on the sort option
 */
export function sortProducts(
  products: Product[],
  sortBy: FilterState['sortBy']
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      // Sort by newArrival first, then by name
      return sorted.sort((a, b) => {
        if (a.newArrival && !b.newArrival) return -1;
        if (!a.newArrival && b.newArrival) return 1;
        return a.name.localeCompare(b.name);
      });
    default:
      return sorted;
  }
}

/**
 * Gets the min/max extents for all filterable dimensions
 */
export function getRangeExtents(products: Product[]): {
  weight: [number, number];
  width: [number, number];
  height: [number, number];
  price: [number, number];
} {
  if (products.length === 0) {
    return {
      weight: [0, 100],
      width: [0, 100],
      height: [0, 200],
      price: [0, 10],
    };
  }

  const weights = products.map((p) => p.dimensions.weight);
  const widths = products.map((p) => p.dimensions.width);
  const heights = products.map((p) => p.dimensions.height);
  const prices = products.map((p) => p.price);

  return {
    weight: [Math.min(...weights), Math.max(...weights)],
    width: [Math.min(...widths), Math.max(...widths)],
    height: [Math.min(...heights), Math.max(...heights)],
    price: [Math.min(...prices), Math.max(...prices)],
  };
}

/**
 * Gets all unique product types from a list of products
 */
export function getUniqueTypes(products: Product[]): string[] {
  const types = new Set(products.map((p) => p.type));
  return Array.from(types).sort();
}

/**
 * Parses a range string from URL params (e.g., "10-50" => [10, 50])
 */
export function parseRangeParam(
  param: string | null,
  defaultRange: [number, number]
): [number, number] {
  if (!param) return defaultRange;

  const parts = param.split('-');
  if (parts.length !== 2) return defaultRange;

  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);

  if (isNaN(min) || isNaN(max)) return defaultRange;

  return [min, max];
}

/**
 * Formats a range to a URL param string (e.g., [10, 50] => "10-50")
 */
export function formatRangeParam(range: [number, number]): string {
  return `${range[0]}-${range[1]}`;
}
