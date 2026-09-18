'use client';

import Image from 'next/image';
import { Droplet, Sparkles, Pill, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import SectionHeading from '@/components/shared/SectionHeading';
import { Stagger } from '@/components/shared/motion';

const productIcons = [Droplet, Sparkles, Pill, Droplet];
const productGradients = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
];
const productBgGradients = [
  'from-rose-500/10 to-pink-600/10 dark:from-rose-500/20 dark:to-pink-600/20',
  'from-violet-500/10 to-purple-600/10 dark:from-violet-500/20 dark:to-purple-600/20',
  'from-cyan-500/10 to-blue-600/10 dark:from-cyan-500/20 dark:to-blue-600/20',
  'from-amber-500/10 to-orange-600/10 dark:from-amber-500/20 dark:to-orange-600/20',
];

const productBgImages: Record<number, { src: string; base: string; overlay: string }> = {
  0: {
    src: '/images/banners/body-care-bg.png',
    base: 'bg-rose-50',
    overlay: 'bg-gradient-to-r from-rose-50 via-rose-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/70',
  },
  1: {
    src: '/images/banners/skincare-bg.png',
    base: 'bg-violet-50',
    overlay: 'bg-gradient-to-r from-violet-50 via-violet-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/70',
  },
  2: {
    src: '/images/banners/pharmacy-bg.png',
    base: 'bg-sky-50',
    overlay: 'bg-gradient-to-r from-sky-50 via-sky-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/70',
  },
  3: {
    src: '/images/banners/pump-lotion-bg.png',
    base: 'bg-amber-50',
    overlay: 'bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/70',
  },
};

export default function ProductsSection() {
  const { dict } = useLang();

  return (
    <section id="products" className="section-padding bg-white dark:bg-gray-900">
      <div className="container-custom mx-auto">
        <SectionHeading
          index="03"
          eyebrow={dict.products.badge}
          title={dict.products.title}
          lead={dict.products.subtitle}
        />
        {/* Products Grid */}
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" step={0.1}>
          {dict.products.items.map((product, index) => {
            const Icon = productIcons[index];
            // First and last cards span two columns so 4 cards fill the 3-col grid: [2+1] / [1+2]
            const isLarge = index === 0 || index === dict.products.items.length - 1;
            const bgImage = productBgImages[index];

            return (
              <Stagger.Item key={index} className={cn('group', isLarge && 'lg:col-span-2')}>
                <div
                  className={cn(
                    'relative h-full rounded-3xl overflow-hidden bg-gradient-to-br border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2',
                    bgImage ? bgImage.base : productBgGradients[index]
                  )}
                >
                  {bgImage && (
                    <>
                      <Image
                        src={bgImage.src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes={isLarge ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
                      />
                      <div className={cn('absolute inset-0', bgImage.overlay)} />
                    </>
                  )}

                  <div className="relative p-6 md:p-8">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform', productGradients[index])}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {product.description}
                    </p>

                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <span className={cn('w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br', productGradients[index])}>
                            <Check className="w-3 h-3 text-white" />
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>
              </Stagger.Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
