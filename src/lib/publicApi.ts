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
