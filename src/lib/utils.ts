import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns the URL only if it's a usable .glb model (filters out placeholder
// cdn.example.com hosts and non-glb paths), else undefined so the viewer can
// fall back to a placeholder model.
export function validGlbUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.includes('cdn.example.com')) return undefined;
  if (!/\.glb($|\?)/i.test(url)) return undefined;
  return url;
}
