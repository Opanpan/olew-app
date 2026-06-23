const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export interface Client {
  id: string;
  name: string;
  logo_url?: string;
  sort_order: number;
}

export interface BannerCarousel {
  id: string;
  title: string;
  description?: string;
  image_path: string;
  url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Showcase {
  id: string;
  title_en: string;
  title_id: string;
  description_en?: string;
  description_id?: string;
  image_url?: string;
  video_url?: string;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  title_en: string;
  title_id: string;
  description_en?: string;
  description_id?: string;
  image_url?: string;
  video_url?: string;
  sort_order: number;
}

async function fetchPublic<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getClients(): Promise<Client[]> {
  return fetchPublic<Client>('/api/v1/public/clients');
}

export function getBannerCarousels(): Promise<BannerCarousel[]> {
  return fetchPublic<BannerCarousel>('/api/v1/public/banner-carousels');
}

export function getShowcases(): Promise<Showcase[]> {
  return fetchPublic<Showcase>('/api/v1/public/showcase');
}

export function getGallery(): Promise<GalleryItem[]> {
  return fetchPublic<GalleryItem>('/api/v1/public/gallery');
}

// ── Product API Types ─────────────────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  name_en: string;
  name_id: string;
  slug_en: string;
  slug_id: string;
  thumbnail: string;
  min_price: number;
  three_d_file_path?: string;
}

export interface ProductMeta {
  limit: number;
  offset: number;
  total: number;
}

export interface ProductsListResponse {
  data: ProductListItem[];
  meta: ProductMeta;
}

export interface ProductDescription {
  long_en: string;
  long_id: string;
  short_en: string;
  short_id: string;
}

export interface ProductImage {
  id: string;
  file_path: string;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface ProductAttribute {
  id: string;
  key: string;
  label_en: string;
  label_id: string;
  value: string;
  sort_order: number;
}

export interface ProductTypeBasic {
  id: string;
  name_en: string;
  name_id: string;
}

export interface ProductCategoryBasic {
  id: string;
  name_en: string;
  name_id: string;
}

export interface ProductDetail {
  id: string;
  name_en: string;
  name_id: string;
  description: ProductDescription | null;
  three_d_file_path?: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  type: ProductTypeBasic;
  category: ProductCategoryBasic;
  shopee_url?: string;
  tokopedia_url?: string;
}

export interface ProductFiltersData {
  types: ProductTypeBasic[];
  categories: ProductCategoryBasic[];
  attributes: Record<string, string[]>;
}

// ── Product API Fetchers ──────────────────────────────────────────────────────

export async function getProducts(query: {
  limit?: number;
  offset?: number;
  search?: string;
  type_id?: string;
  category_id?: string;
}): Promise<ProductsListResponse> {
  try {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    if (query.offset !== undefined) params.set('offset', String(query.offset));
    if (query.search) params.set('search', query.search);
    if (query.type_id) params.set('type_id', query.type_id);
    if (query.category_id) params.set('category_id', query.category_id);

    const qs = params.toString();
    const url = `${BASE_URL}/api/v1/public/products${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { data: [], meta: { limit: 12, offset: 0, total: 0 } };
    const json = await res.json();
    // Response envelope: { data: { data: [], meta: {} } }
    const inner = json?.data;
    const data: ProductListItem[] = Array.isArray(inner?.data) ? inner.data : [];
    const meta: ProductMeta = inner?.meta ?? { limit: 12, offset: 0, total: 0 };
    return { data, meta };
  } catch {
    return { data: [], meta: { limit: 12, offset: 0, total: 0 } };
  }
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/public/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    // Response envelope: { data: ProductDetail }
    return (json?.data as ProductDetail) ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(id: string): Promise<ProductListItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/public/products/${id}/related`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    // Response envelope: { data: ProductListItem[] }
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getProductFiltersData(): Promise<ProductFiltersData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/public/products/filters`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;
    return {
      types: Array.isArray(data.types) ? data.types : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      attributes: (data.attributes && typeof data.attributes === 'object') ? data.attributes : {},
    };
  } catch {
    return null;
  }
}
