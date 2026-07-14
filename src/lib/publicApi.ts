const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const IS_DEV = process.env.NODE_ENV === 'development';

function devLog(url: string, status: number, payload: unknown, response: unknown) {
  if (!IS_DEV) return;
  const ok = status >= 200 && status < 300;
  console.log(
    `\n\x1b[36m[API]\x1b[0m ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} GET ${url} \x1b[90m(${status})\x1b[0m`
  );
  if (payload !== null) console.log('  \x1b[33mpayload\x1b[0m:', payload);
  console.log('  \x1b[33mresponse\x1b[0m:', JSON.stringify(response, null, 2));
}

// ── CMS Types ─────────────────────────────────────────────────────────────────

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

// ── CMS Fetchers ──────────────────────────────────────────────────────────────

async function fetchPublic<T>(path: string): Promise<T[]> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const json = await res.json();
    devLog(url, res.status, null, json);
    if (!res.ok) return [];
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
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

/** Per-product attribute value returned in list and detail responses */
export interface ProductAttributePublicItem {
  label_en: string;
  label_id: string;
  value: string;
  unit?: string;
}

export interface ProductListItem {
  id: string;
  name_en: string;
  name_id: string;
  slug_en: string;
  slug_id: string;
  thumbnail: string;
  min_price: number;
  three_d_file_path?: string;
  /** Key → attribute data (e.g. material, volume, height) — enables real attribute filtering */
  attributes?: Record<string, ProductAttributePublicItem>;
}

/** Attribute definition from /product-attribute-definitions */
export interface AttributeDefinition {
  id: string;
  key: string;
  label_en: string;
  label_id: string;
  description_en?: string;
  description_id?: string;
  data_type: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
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

export interface CompatibleProduct {
  id: string;
  name_en: string;
  name_id: string;
  three_d_file_path?: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  min_position_vertical?: number | null;
  max_position_vertical?: number | null;
}

export interface ProductCompatibility {
  product_id: string;
  name_en: string;
  name_id: string;
  three_d_file_path?: string;
  compatible: CompatibleProduct[];
}

export interface ProductFiltersData {
  types: ProductTypeBasic[];
  categories: ProductCategoryBasic[];
  attributes: Record<string, string[]>;
  price_range?: { min: number; max: number };
}

// ── Product API Fetchers ──────────────────────────────────────────────────────

export async function getProducts(query: {
  limit?: number;
  offset?: number;
  search?: string;
  type_id?: string;
  category_id?: string;
}): Promise<ProductsListResponse> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));
  if (query.search) params.set('search', query.search);
  if (query.type_id) params.set('type_id', query.type_id);
  if (query.category_id) params.set('category_id', query.category_id);

  const qs = params.toString();
  const url = `${BASE_URL}/api/v1/public/products${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    devLog(url, res.status, Object.fromEntries(params), json);
    if (!res.ok) return { data: [], meta: { limit: 12, offset: 0, total: 0 } };
    const inner = json?.data;
    const raw: ProductListItem[] = Array.isArray(inner?.data) ? inner.data : [];
    const seen = new Set<string>();
    const data = raw.filter(p => seen.has(p.id) ? false : (seen.add(p.id), true));
    const meta: ProductMeta = inner?.meta ?? { limit: 12, offset: 0, total: 0 };
    return { data, meta };
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return { data: [], meta: { limit: 12, offset: 0, total: 0 } };
  }
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  const url = `${BASE_URL}/api/v1/public/products/${id}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    devLog(url, res.status, { id }, json);
    if (!res.ok) return null;
    return (json?.data as ProductDetail) ?? null;
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return null;
  }
}

export async function getRelatedProducts(id: string): Promise<ProductListItem[]> {
  const url = `${BASE_URL}/api/v1/public/products/${id}/related`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    devLog(url, res.status, { id }, json);
    if (!res.ok) return [];
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return [];
  }
}

export async function getProductCompatibilities(id: string): Promise<ProductCompatibility | null> {
  const url = `${BASE_URL}/api/v1/public/products/${id}/compatibilities`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    devLog(url, res.status, { id }, json);
    if (!res.ok) return null;
    // Envelope: { data: { data: { product_id, compatible: [] } } }
    return (json?.data?.data as ProductCompatibility) ?? null;
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return null;
  }
}

export async function getProductFiltersData(): Promise<ProductFiltersData | null> {
  const url = `${BASE_URL}/api/v1/public/products/filters`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();
    devLog(url, res.status, null, json);
    if (!res.ok) return null;
    const data = json?.data;
    if (!data) return null;
    return {
      types: Array.isArray(data.types) ? data.types : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      attributes: (data.attributes && typeof data.attributes === 'object') ? data.attributes : {},
      price_range: data.price_range ?? undefined,
    };
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return null;
  }
}

// ── Latest / Popular / Attribute Definitions ─────────────────────────────────

async function fetchProductList(url: string): Promise<ProductListItem[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    devLog(url, res.status, null, json);
    if (!res.ok) return [];
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return [];
  }
}

export function getLatestProducts(): Promise<ProductListItem[]> {
  return fetchProductList(`${BASE_URL}/api/v1/public/products/latest`);
}

export function getPopularProducts(): Promise<ProductListItem[]> {
  return fetchProductList(`${BASE_URL}/api/v1/public/products/popular`);
}

export interface AttributeDefinitionListResponse {
  attributes: AttributeDefinition[];
  total_count: number;
}

export async function getAttributeDefinitions(): Promise<AttributeDefinitionListResponse | null> {
  const url = `${BASE_URL}/api/v1/public/product-attribute-definitions`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();
    devLog(url, res.status, null, json);
    if (!res.ok) return null;
    const data = json?.data;
    if (!data) return null;
    return {
      attributes: Array.isArray(data.attributes) ? data.attributes : [],
      total_count: data.total_count ?? 0,
    };
  } catch (err) {
    if (IS_DEV) console.error(`\x1b[36m[API]\x1b[0m \x1b[31m✗\x1b[0m GET ${url} —`, err);
    return null;
  }
}
