'use client';

import { cn } from '@/lib/utils';

export const PRODUCT_PLACEHOLDER = '/images/placeholder-product.svg';
export const BROKEN_IMAGE = '/images/broken-image.svg';

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  /** Which fallback to show on error. Defaults to broken-image. */
  fallback?: string;
}

export default function ImgWithFallback({
  src,
  alt,
  className,
  fallback = BROKEN_IMAGE,
  ...props
}: ImgWithFallbackProps) {
  return (
    <img
      {...props}
      src={src || fallback}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = fallback;
        // SVG placeholders look better with object-contain
        e.currentTarget.className = e.currentTarget.className
          .replace(/object-cover/g, 'object-contain');
      }}
      className={cn('object-cover', className)}
    />
  );
}
