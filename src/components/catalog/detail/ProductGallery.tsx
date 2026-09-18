'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !emblaThumbsApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
  }, [emblaApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const navButton = 'absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="overflow-hidden rounded-md" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                  <ImgWithFallback
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fallback={PRODUCT_PLACEHOLDER}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button type="button" onClick={scrollPrev} aria-label={d.prev_image} className={cn(navButton, 'left-3')}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={scrollNext} aria-label={d.next_image} className={cn(navButton, 'right-3')}>
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-white/90 px-1.5 py-0.5 text-xs tabular-nums text-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
              {selectedIndex + 1} / {images.length}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label={d.fullscreen}
          title={d.fullscreen}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onThumbClick(index)}
                aria-label={`${productName} ${index + 1}`}
                aria-current={index === selectedIndex}
                className={cn(
                  'aspect-square min-w-0 flex-[0_0_18%] overflow-hidden rounded bg-gray-100 dark:bg-gray-900',
                  index === selectedIndex ? 'ring-2 ring-primary-600 dark:ring-primary-400' : 'opacity-70 hover:opacity-100'
                )}
              >
                <ImgWithFallback src={image} alt="" fallback={PRODUCT_PLACEHOLDER} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal — portaled to body so it escapes the sticky column's stacking context */}
      {mounted && createPortal(
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label={d.close_fullscreen}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <ImgWithFallback
                src={images[selectedIndex]}
                alt={productName}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
