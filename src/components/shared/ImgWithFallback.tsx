'use client';

import { cn } from '@/lib/utils';

const FALLBACK = '/images/banners/broken-image.png';

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
}

export default function ImgWithFallback({ src, alt, className, ...props }: ImgWithFallbackProps) {
  return (
    <img
      {...props}
      src={src || FALLBACK}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = FALLBACK;
      }}
      className={cn('object-cover', className)}
    />
  );
}
