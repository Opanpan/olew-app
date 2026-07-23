'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
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

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative">
        {/* Premium framed card */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="relative overflow-hidden rounded-3xl" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    {/* subtle grid/vignette accents */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_60%,rgba(0,0,0,0.05))] dark:bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(0,0,0,0.35))]" />
                    <ImgWithFallback
                      src={image}
                      alt={`${productName} - Image ${index + 1}`}
                      fallback={PRODUCT_PLACEHOLDER}
                      className="relative w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 p-2 md:p-2.5 rounded-full bg-white/85 dark:bg-gray-800/85 backdrop-blur-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 p-2 md:p-2.5 rounded-full bg-white/85 dark:bg-gray-800/85 backdrop-blur-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 md:top-5 right-4 md:right-5 p-2.5 rounded-full bg-white/85 dark:bg-gray-800/85 backdrop-blur-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 text-gray-700 dark:text-gray-200 hover:bg-primary-500 hover:text-white hover:scale-110 active:scale-95 transition-all"
            aria-label="View fullscreen"
          >
            <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] md:text-xs font-semibold tracking-wide backdrop-blur-md ring-1 ring-white/10">
              {selectedIndex + 1} <span className="opacity-50">/</span> {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-2 md:gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={cn(
                  'flex-[0_0_20%] md:flex-[0_0_15%] min-w-0 aspect-square rounded-lg md:rounded-xl overflow-hidden border-2 transition-all',
                  index === selectedIndex
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                )}
              >
                <ImgWithFallback
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fallback={PRODUCT_PLACEHOLDER}
                  className="w-full h-full object-contain p-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                  loading="lazy"
                />
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <ChevronRight className="w-6 h-6 text-white rotate-45" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <ImgWithFallback
                src={images[selectedIndex]}
                alt={`${productName} - Fullscreen`}
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
